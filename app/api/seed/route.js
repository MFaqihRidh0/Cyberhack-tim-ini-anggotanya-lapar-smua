import supabase from '@/lib/server/db';
import { verifyAuth, unauthorized, forbidden, checkRole } from '@/lib/server/auth';

const SUPPLIERS = [
  { name: 'PT Rempah Nusantara', code: 'SUP-001', contact_name: 'Budi Santoso', phone: '081234567890', email: 'budi@rempahnusantara.co.id' },
  { name: 'CV Herbal Indonesia', code: 'SUP-002', contact_name: 'Siti Rahayu', phone: '081345678901', email: 'siti@herbalindonesia.com' },
  { name: 'PT Buah Tropis', code: 'SUP-003', contact_name: 'Agus Wijaya', phone: '081456789012', email: 'agus@buahtropis.co.id' },
  { name: 'CV Alam Segar', code: 'SUP-004', contact_name: 'Dewi Lestari', phone: '081567890123', email: 'dewi@alamsegar.com' },
  { name: 'PT Botanika Prima', code: 'SUP-005', contact_name: 'Hendra Kusuma', phone: '081678901234', email: 'hendra@botanikaprima.co.id' },
];

const MATERIALS = [
  { name: 'Vanili Madagascar', code: 'MAT-VNL', category: 'Rempah', unit: 'kg', shelf_life_days: 365, storage_note: 'Simpan di tempat kering, suhu ruang' },
  { name: 'Jahe Merah', code: 'MAT-JHM', category: 'Rempah', unit: 'kg', shelf_life_days: 180, storage_note: 'Cold storage 4°C' },
  { name: 'Pandan Wangi', code: 'MAT-PDN', category: 'Herbal', unit: 'kg', shelf_life_days: 90, storage_note: 'Cold storage -4°C' },
  { name: 'Kayu Manis', code: 'MAT-KYM', category: 'Rempah', unit: 'kg', shelf_life_days: 365, storage_note: 'Simpan di tempat kering' },
  { name: 'Bunga Telang', code: 'MAT-BGT', category: 'Herbal', unit: 'kg', shelf_life_days: 120, storage_note: 'Hindari sinar matahari langsung' },
  { name: 'Serai', code: 'MAT-SRI', category: 'Herbal', unit: 'kg', shelf_life_days: 90, storage_note: 'Cold storage 4°C' },
  { name: 'Lemon', code: 'MAT-LMN', category: 'Buah', unit: 'kg', shelf_life_days: 30, storage_note: 'Cold storage 4°C, pisahkan dari bahan berbau kuat' },
  { name: 'Mangga', code: 'MAT-MNG', category: 'Buah', unit: 'kg', shelf_life_days: 14, storage_note: 'Cold storage 4°C, periksa kematangan harian' },
];

const PRODUCTS = [
  { name: 'Ekstrak Vanili 10x', code: 'PRD-EVN', category: 'Ekstrak Cair', unit: 'liter', shelf_life_days: 730 },
  { name: 'Ekstrak Jahe Merah', code: 'PRD-EJM', category: 'Ekstrak Cair', unit: 'liter', shelf_life_days: 365 },
  { name: 'Bubuk Pandan', code: 'PRD-BPD', category: 'Bubuk', unit: 'kg', shelf_life_days: 180 },
  { name: 'Ekstrak Kayu Manis', code: 'PRD-EKM', category: 'Ekstrak Cair', unit: 'liter', shelf_life_days: 365 },
  { name: 'Bubuk Lemon', code: 'PRD-BLM', category: 'Bubuk', unit: 'kg', shelf_life_days: 180 },
];

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) return unauthorized();

  const results = { suppliers: 0, materials: 0, products: 0, errors: [] };

  // Seed suppliers
  for (const s of SUPPLIERS) {
    const { data: existing } = await supabase.from('suppliers').select('id').eq('code', s.code).limit(1);
    if (existing && existing.length > 0) { results.suppliers++; continue; }
    const { error } = await supabase.from('suppliers').insert(s);
    if (!error) results.suppliers++;
    else results.errors.push(`Supplier ${s.code}: ${error.message}`);
  }

  // Seed materials
  for (const m of MATERIALS) {
    const { data: existing } = await supabase.from('materials').select('id').eq('code', m.code).limit(1);
    if (existing && existing.length > 0) { results.materials++; continue; }
    const { error } = await supabase.from('materials').insert(m);
    if (!error) results.materials++;
    else results.errors.push(`Material ${m.code}: ${error.message}`);
  }

  // Seed products
  for (const p of PRODUCTS) {
    const { data: existing } = await supabase.from('products').select('id').eq('code', p.code).limit(1);
    if (existing && existing.length > 0) { results.products++; continue; }
    const { error } = await supabase.from('products').insert(p);
    if (!error) results.products++;
    else results.errors.push(`Product ${p.code}: ${error.message}`);
  }

  return Response.json({
    success: true,
    data: results,
    message: `Seeded: ${results.suppliers} suppliers, ${results.materials} materials, ${results.products} products`,
  });
}
