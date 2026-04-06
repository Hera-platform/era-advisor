"use client";

const SESSION_TOKEN_KEY = "era_session_token";
const SELLER_ID_KEY = "era_anonymous_seller_id";
const DEAL_ID_KEY = "era_deal_id";

const isBrowser = typeof window !== "undefined";

export function getOrCreateSessionToken(): string {
  if (!isBrowser) return "";
  let token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
}

export function getSessionToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function getStoredSellerId(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(SELLER_ID_KEY);
}

export function setStoredSellerId(id: string): void {
  if (!isBrowser) return;
  localStorage.setItem(SELLER_ID_KEY, id);
}

export function getStoredDealId(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(DEAL_ID_KEY);
}

export function setStoredDealId(id: string): void {
  if (!isBrowser) return;
  localStorage.setItem(DEAL_ID_KEY, id);
}

export function clearAnonymousIds(): void {
  if (!isBrowser) return;
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SELLER_ID_KEY);
  localStorage.removeItem(DEAL_ID_KEY);
}
