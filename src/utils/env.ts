/// <reference types="vite/client" />

// Safe environment variable helper with fallbacks to avoid crashes when public keys are missing
export const getEnv = (key: string, fallback: string = ''): string => {
  try {
    const meta = import.meta as unknown as { env?: Record<string, string | undefined> };
    if (meta && meta.env) {
      const val = meta.env[key];
      if (val !== undefined && val !== null) {
        return val;
      }
    }
  } catch (err) {
    console.warn(`[Env] Failed to read environment variable "${key}":`, err);
  }
  return fallback;
};

export const API_CONFIG = {
  GEMINI_API_KEY: getEnv('VITE_GEMINI_API_KEY', ''),
  VIETQR_CLIENT_ID: getEnv('VITE_VIETQR_CLIENT_ID', 'demo-client-id'),
  VIETQR_API_KEY: getEnv('VITE_VIETQR_API_KEY', 'demo-api-key'),
  APP_URL: getEnv('VITE_APP_URL', typeof window !== 'undefined' ? window.location.origin : ''),
  IS_DEV: getEnv('DEV', 'false') === 'true',
};
