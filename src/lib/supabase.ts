import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

const apiRoot = supabaseUrl ? `${supabaseUrl.replace(/\/+$/, '')}/` : undefined;

const fetchWithTimeout: typeof fetch = (input, init) => {
  const url = input instanceof Request ? input.url : String(input);
  if (!apiRoot || !url.startsWith(apiRoot))
    return fetch(input, init);

  const existingSignal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
  const controller = new AbortController();
  const abort = () => controller.abort(existingSignal?.reason);
  if (existingSignal?.aborted) abort();
  else existingSignal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException(
    'The request timed out. Check your connection and try again.', 'TimeoutError',
  )), url.startsWith(`${apiRoot}storage/`) ? 45_000 : 20_000);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
    existingSignal?.removeEventListener('abort', abort);
  });
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      global: { fetch: fetchWithTimeout },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
