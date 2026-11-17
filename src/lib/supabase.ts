import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

const signupUrl = supabaseUrl ? `${supabaseUrl.replace(/\/+$/, '')}/auth/v1/signup` : undefined;

const fetchWithSignupTimeout: typeof fetch = (input, init) => {
  const url = input instanceof Request ? input.url : String(input);
  if (!signupUrl || url.split('?')[0] !== signupUrl)
    return fetch(input, init);

  const timeout = AbortSignal.timeout(20_000);
  const existingSignal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
  const signal = existingSignal ? AbortSignal.any([existingSignal, timeout]) : timeout;
  return fetch(input, { ...init, signal });
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      global: { fetch: fetchWithSignupTimeout },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
