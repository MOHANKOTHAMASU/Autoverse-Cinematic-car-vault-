// AutoVerse: Supabase Client & Backend Integration Gateway
// Initializes Supabase client with environment variables when configured,
// and gracefully falls back to local client-side persistence for offline PWA operation.

import { createClient } from '@supabase/supabase-js';

// Environment variables configured in Vite (.env / Vercel dashboard)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Production Supabase Client instance (null when not configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Health check helper for verifying Supabase connectivity
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      connected: false,
      message: 'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured. Running in offline/local-first mode.',
    };
  }

  const startTime = Date.now();
  try {
    const { error } = await supabase.from('vehicles').select('id').limit(1);
    const latencyMs = Date.now() - startTime;
    if (error && error.code !== 'PGRST116') {
      return {
        connected: false,
        message: `Supabase query returned error: ${error.message} (${error.code})`,
        latencyMs,
      };
    }
    return {
      connected: true,
      message: 'Successfully connected to AutoVerse Supabase cluster.',
      latencyMs,
    };
  } catch (err: unknown) {
    return {
      connected: false,
      message: `Failed to reach Supabase: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
