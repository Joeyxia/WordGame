const TOKEN_KEY = "wq_token";
const CHILD_KEY = "wq_child_id";

export function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export function getSelectedChild() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(CHILD_KEY) || "";
}

export function setSelectedChild(childId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHILD_KEY, childId);
}
