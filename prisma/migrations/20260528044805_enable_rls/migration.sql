-- Enable RLS on all tables
-- Our backend uses Express + Prisma (postgres superuser) which bypasses RLS.
-- Policies below allow the postgres role full access, blocking anonymous PostgREST calls.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Material" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeliveryOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RawMaterialLot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RawLotStage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QCInspection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductionOrder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductionInput" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FinishedGoodsLot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FinishedLotStage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SampleDispatch" ENABLE ROW LEVEL SECURITY;

-- Allow full access for postgres (service role used by our backend)
CREATE POLICY "backend_full_access" ON "User"             FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "backend_full_access" ON "Supplier"         FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "backend_full_access" ON "Material"         FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "backend_full_access" ON "Product"          FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "backend_full_access" ON "DeliveryOrder"    FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "backend_full_access" ON "RawMaterialLot"   FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "backend_full_access" ON "RawLotStage"      FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "backend_full_access" ON "QCInspection"     FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "backend_full_access" ON "ProductionOrder"  FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "backend_full_access" ON "ProductionInput"  FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "backend_full_access" ON "FinishedGoodsLot" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "backend_full_access" ON "FinishedLotStage" FOR ALL TO postgres USING (true) WITH CHECK (true);
CREATE POLICY "backend_full_access" ON "SampleDispatch"   FOR ALL TO postgres USING (true) WITH CHECK (true);
