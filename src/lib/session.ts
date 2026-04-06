"use client";

const SESSION_TOKEN_KEY = "era_session_token";
const SELLER_ID_KEY = "era_anonymous_seller_id";
const DEAL_ID_KEY = "era_deal_id";

export function getOrCreateSessionToken(): string {
  let token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
}

export function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

export function getStoredSellerId(): string | null {
  return localStorage.getItem(SELLER_ID_KEY);
}

export function setStoredSellerId(id: string): void {
  localStorage.setItem(SELLER_ID_KEY, id);
}

export function getStoredDealId(): string | null {
  return localStorage.getItem(DEAL_ID_KEY);
}

export function setStoredDealId(id: string): void {
  localStorage.setItem(DEAL_ID_KEY, id);
}

export function clearAnonymousIds(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SELLER_ID_KEY);
  localStorage.removeItem(DEAL_ID_KEY);
}
