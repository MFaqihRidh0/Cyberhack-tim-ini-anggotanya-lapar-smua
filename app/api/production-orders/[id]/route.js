import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';
import { generateLotNumber } from '@/lib/server/lotNumber';

export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const { data: order } = await supabase.from('production_orders').select('*, product:products(*), created_by:users(id, name)').eq('id', id).single();
  if (!order) return Response.json({ success: false, data: null, message: 'PO tidak ditemukan' }, { status: 404 });

  const { data: inputs } = await supabase.from('production_inputs').select('*, raw_lot:raw_material_lots(id, internal_lot_no, current_status), material:materials(*)').eq('production_order_id', id);
  const { data: finishedLots } = await supabase.from('finished_goods_lots').select('*').eq('production_order_id', id);

  return Response.json({ success: true, data: { ...order, inputs: inputs || [], finishedLots: finishedLots || [] }, message: 'Berhasil' });
}

export async function PATCH(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();
  if (!checkRole(user, 'PPIC', 'MANAGER')) return forbidden();

  const { id } = await params;
  const body = await request.json();

  const { data: order } = await supabase.from('production_orders').select('*, product:products(*)').eq('id', id).single();
  if (!order) return Response.json({ success: false, data: null, message: 'PO tidak ditemukan' }, { status: 404 });

  const updateData = {};
  if (body.scheduledDate !== undefined || body.scheduled_date !== undefined) updateData.scheduled_date = body.scheduledDate || body.scheduled_date;
  if (body.priority !== undefined) updateData.priority = Number(body.priority);
  if (body.notes !== undefined) updateData.notes = body.notes;

  const status = body.status;
  if (status) {
    updateData.status = status;
    if (status === 'IN_PROGRESS') updateData.started_at = new Date().toISOString();

    if (status === 'COMPLETED') {
      const actualQty = body.actualQty || body.actual_qty;
      if (!actualQty) return Response.json({ success: false, data: null, message: 'actualQty wajib diisi saat COMPLETED' }, { status: 400 });
      updateData.actual_qty = Number(actualQty);
      updateData.completed_at = new Date().toISOString();

      await supabase.from('production_orders').update(updateData).eq('id', id);

      // Mark raw lots: CONSUMED if fully used, back to IN_QUEUE if partially used
      const { data: inputs } = await supabase.from('production_inputs').select('raw_lot_id, qty_used').eq('production_order_id', id);
      const lotUsageMap = {};
      for (const inp of (inputs || [])) {
        lotUsageMap[inp.raw_lot_id] = (lotUsageMap[inp.raw_lot_id] || 0) + inp.qty_used;
      }

      for (const [rawLotId, totalUsed] of Object.entries(lotUsageMap)) {
        const { data: rawLot } = await supabase.from('raw_material_lots').select('initial_qty').eq('id', rawLotId).single();
        if (!rawLot) continue;

        // Also check usage from OTHER production orders
        const { data: allInputs } = await supabase.from('production_inputs').select('qty_used').eq('raw_lot_id', rawLotId);
        const totalUsedAll = (allInputs || []).reduce((s, i) => s + i.qty_used, 0);

        if (totalUsedAll >= rawLot.initial_qty) {
          // Fully consumed
          await supabase.from('raw_material_lots').update({ current_status: 'CONSUMED' }).eq('id', rawLotId);
          await supabase.from('raw_lot_stages').insert({ raw_lot_id: rawLotId, stage: 'CONSUMED', actor_id: user.id, notes: `Fully used (${totalUsedAll}/${rawLot.initial_qty})` });
        } else {
          // Partially used — return to IN_QUEUE so it can be used again
          await supabase.from('raw_material_lots').update({ current_status: 'IN_QUEUE' }).eq('id', rawLotId);
          await supabase.from('raw_lot_stages').insert({ raw_lot_id: rawLotId, stage: 'IN_QUEUE', actor_id: user.id, notes: `Partially used (${totalUsedAll}/${rawLot.initial_qty}), returned to queue` });
        }
      }

      // Auto-create FinishedGoodsLot
      const lot_number = await generateLotNumber('SA-FG');
      const { data: fg } = await supabase.from('finished_goods_lots').insert({
        lot_number, product_id: order.product_id, production_order_id: id,
        quantity: Number(actualQty), unit: order.product.unit, current_status: 'PRODUCED',
      }).select().single();

      if (fg) {
        await supabase.from('finished_lot_stages').insert({ finished_lot_id: fg.id, stage: 'PRODUCED', actor_id: user.id, notes: 'Production completed' });
      }

      const updated = await supabase.from('production_orders').select('*, product:products(*)').eq('id', id).single();
      return Response.json({ success: true, data: updated.data, message: 'PO COMPLETED, raw lots consumed, Finished Goods Lot created' });
    }
  }

  await supabase.from('production_orders').update(updateData).eq('id', id);
  const { data: updated } = await supabase.from('production_orders').select('*, product:products(*)').eq('id', id).single();
  return Response.json({ success: true, data: updated, message: 'Production Order diupdate' });
}
