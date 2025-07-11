import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://<PROJECT-ID>.supabase.co'; // Will be replaced with actual URL
const supabaseAnonKey = '<ANON-KEY>'; // Will be replaced with actual key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);