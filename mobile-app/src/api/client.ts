import * as SecureStore from 'expo-secure-store';

// The address baked in at build time from mobile-app/.env. It is only the
// *default*: the app stores whatever address the user sets on the login
// screen, so switching between an emulator, a phone on the office Wi-Fi and
// a real server never requires another build.
const BUILD_TIME_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

// An Android emulator cannot reach the host machine by its LAN IP or by
// "localhost" (that is the emulator itself). 10.0.2.2 is the alias the
// emulator maps to the computer running it.
export const EMULATOR_API_URL = 'http://10.0.2.2:3002/api/v1';

export const DEFAULT_API_URL = BUILD_TIME_API_URL;
export const TOKEN_KEY = 'cam_cow_auth_token';
const API_URL_KEY = 'cam_cow_api_url';

let cachedApiUrl: string | null = null;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Accepts what someone would realistically type — "10.0.2.2",
 * "192.168.1.50:3002", "http://host:3002" — and completes it into a full
 * API base URL.
 */
export function normalizeApiUrl(input: string): string {
  let url = (input || '').trim();
  if (!url) return DEFAULT_API_URL;
  if (!/^https?:\/\//i.test(url)) url = `http://${url}`;
  url = url.replace(/\/+$/, '');
  if (!/:\d+/.test(url)) url = `${url}:3002`;
  if (!/\/api\/v\d+$/i.test(url)) url = `${url}/api/v1`;
  return url;
}

export async function getApiBaseUrl(): Promise<string> {
  if (cachedApiUrl) return cachedApiUrl;
  // Resolved into a local first: assigning only to the module-level cache
  // leaves its type as `string | null` at the return statement.
  let resolved = DEFAULT_API_URL;
  try {
    const stored = await SecureStore.getItemAsync(API_URL_KEY);
    if (stored) resolved = stored;
  } catch {
    // Storage unavailable — the build-time default still works.
  }
  cachedApiUrl = resolved;
  return resolved;
}

export async function setApiBaseUrl(input: string): Promise<string> {
  const url = normalizeApiUrl(input);
  cachedApiUrl = url;
  try {
    await SecureStore.setItemAsync(API_URL_KEY, url);
  } catch {
    // Keeping it in memory still fixes the current session.
  }
  return url;
}

export async function resetApiBaseUrl(): Promise<string> {
  cachedApiUrl = DEFAULT_API_URL;
  try {
    await SecureStore.deleteItemAsync(API_URL_KEY);
  } catch {
    // ignore
  }
  return DEFAULT_API_URL;
}

/**
 * Pings the backend's /health endpoint so the user can confirm an address
 * works before typing credentials against it. /health sits at the server
 * root, outside the /api/v1 prefix.
 */
export async function checkServer(candidate?: string): Promise<{ ok: boolean; message: string }> {
  const base = candidate ? normalizeApiUrl(candidate) : await getApiBaseUrl();
  const healthUrl = base.replace(/\/api\/v\d+$/i, '') + '/health';
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(healthUrl, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok
      ? { ok: true, message: 'Connected. The server is reachable.' }
      : { ok: false, message: `Server answered with ${res.status}. Check the backend logs.` };
  } catch {
    return { ok: false, message: `No answer from ${healthUrl}. Check the address and that the backend is running.` };
  }
}

/**
 * Signs in with a PIN only. The server decides which account the PIN belongs
 * to, and locks out after repeated failures — this just carries the attempt.
 */
export async function loginWithPin<T>(pin: string): Promise<T> {
  return apiFetch<T>('/auth/pin', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ pin })
  });
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

interface FetchOptions extends RequestInit {
  auth?: boolean; // attach Bearer token — default true
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const base = await getApiBaseUrl();
  const url = `${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined)
  };

  if (auth) {
    const token = await getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, { ...rest, headers: finalHeaders });
  } catch {
    throw new ApiError(0, `Can't reach the server at ${base}. Open Server settings below to change the address.`);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, body?.message || `Request failed (${response.status})`);
  }

  return (body?.data !== undefined ? body.data : body) as T;
}
