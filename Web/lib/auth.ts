export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export const TOKEN_KEY = "astlora_access_token";

export type SteamUser = {
  id: number;
  steam_id: string | null;
  username: string;
  email: string | null;
  nickname: string | null;
  phone: string | null;
  avatar_url: string | null;
  profile_url: string | null;
  is_active: boolean;
  created_at: string;
};

export async function fetchCurrentUser(token: string): Promise<SteamUser> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Steam session expired. Please sign in again.");
  }

  return response.json() as Promise<SteamUser>;
}
