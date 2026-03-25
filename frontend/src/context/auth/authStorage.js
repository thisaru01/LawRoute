const AUTH_TOKEN_KEY = "auth_token";
const AUTH_TOKEN_EVENT = "lawroute:auth_token_changed";

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  // Notify listeners in the same tab (storage event doesn't fire there)
  window.dispatchEvent(
    new CustomEvent(AUTH_TOKEN_EVENT, { detail: getAuthToken() }),
  );
}

export function subscribeAuthToken(callback) {
  if (typeof window === "undefined") return () => {};

  const onCustomEvent = (event) => {
    callback(event?.detail ?? getAuthToken());
  };

  const onStorage = (event) => {
    if (event?.key !== AUTH_TOKEN_KEY) return;
    callback(event?.newValue ?? null);
  };

  window.addEventListener(AUTH_TOKEN_EVENT, onCustomEvent);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(AUTH_TOKEN_EVENT, onCustomEvent);
    window.removeEventListener("storage", onStorage);
  };
}
