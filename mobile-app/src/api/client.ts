import * as SecureStore from 'expo-secure-store';

// Set EXPO_PUBLIC_API_URL in mobile-app/.env to your computer's LAN IP,
// e.g. http://192.168.1.42:3002/api/v1 — "localhost" from a phone means
// the phone itself, not your computer, so it will never reach the backend.
// See mobile-app/README.md.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

export const TOKEN_KEY = 'cam_cow_auth_token';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
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
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

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
  } catch (err) {
    throw new ApiError(0, `Could not reach the server at ${API_BASE_URL}. Check EXPO_PUBLIC_API_URL and that the backend is running.`);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, body?.message || `Request failed (${response.status})`);
  }

  return (body?.data !== undefined ? body.data : body) as T;
}
