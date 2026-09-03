"use client";
const AUTH_KEY = "ame_admin_auth_2026";
export const VALID_ID = "ame2026";
export const VALID_PASS = "ame@2026";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}
export function login(id: string, pass: string): boolean {
  if (id === VALID_ID && pass === VALID_PASS) {
    localStorage.setItem(AUTH_KEY, "true");
    window.dispatchEvent(new CustomEvent("auth-changed"));
    return true;
  }
  return false;
}
export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new CustomEvent("auth-changed"));
}
