// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Baca variabel dari .env menggunakan import.meta.env (khusus Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);