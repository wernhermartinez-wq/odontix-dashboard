import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahjgahcqpnhrkivdtdit.supabase.co';
const supabaseAnonKey = 'sb_publishable_xu35HC4t2nuXWqMCpcVF5g_Mct5fAWI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
