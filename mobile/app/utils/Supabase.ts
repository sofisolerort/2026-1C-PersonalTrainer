// lib/supabase.ts

import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Pegás tus credenciales acá directo entre comillas
const supabaseUrl:string = 'https://qfhsnavmpwyjkxmiewon.supabase.com';
const supabaseAnonKey = 'sb_publishable_pLcezGiFIUWbvJyCOwM_rw_y_B0SBDY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});