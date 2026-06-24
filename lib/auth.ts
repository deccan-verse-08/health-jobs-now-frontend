// Client-side token/user storage helpers. Always guard with `typeof window`.
import { TOKEN_COOKIE, TOKEN_KEY, USER_KEY } from "./constants";
import type { User } from "@/types/api";

export function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function readUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as User;
    if (user && user.roles) {
      user.roles = user.roles.map((r: string) => r.replace("ROLE_", "") as any);
    }
    return user;
  } catch {
    return null;
  }
}

export function writeSession(token: string, user: User) {
  if (typeof window === "undefined") return;
  if (user && user.roles) {
    user.roles = user.roles.map((r: string) => r.replace("ROLE_", "") as any);
  }
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Mirror token into a non-httpOnly cookie so middleware can do a
  // presence check. Real JWT validation still happens via /api/auth/profile
  // on the client.
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=86400; SameSite=Lax`;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
