const TOKEN_KEY = "plataforma_psi_token";
const PERSISTENT_TOKEN_KEY = "plataforma_psi_persistent_token";

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  return window.sessionStorage.getItem(TOKEN_KEY) ?? window.localStorage.getItem(PERSISTENT_TOKEN_KEY);
}

export function setToken(token: string, remember = false) {
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(PERSISTENT_TOKEN_KEY);

  if (remember) {
    window.localStorage.setItem(PERSISTENT_TOKEN_KEY, token);
    return;
  }

  window.sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(PERSISTENT_TOKEN_KEY);
}
