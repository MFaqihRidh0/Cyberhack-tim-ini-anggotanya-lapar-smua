import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://f19f407b-b0a2-49e5-8a54-95a8b031189f.db2.buildpad.ai';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODAxMjkyNTMsImV4cCI6NDkzMzcyOTI1M30.lpC6jBK4W2Kk-stnyl2qsOVHXDQv5MkMOnH7dew3KcE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;
