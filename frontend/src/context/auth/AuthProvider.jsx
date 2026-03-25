import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "./authContext";
import { getAuthToken, setAuthToken, subscribeAuthToken } from "./authStorage";
import { parseJwt } from "./jwt";
import { getMe } from "@/api/services/userService";

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getAuthToken());
  const [user, setUser] = useState(null);

  useEffect(() => subscribeAuthToken(setTokenState), []);

  const claims = useMemo(() => parseJwt(token), [token]);

  useEffect(() => {
    let cancelled = false;

    async function loadUserProfile() {
      if (!token || !claims?.role) {
        setUser(null);
        return;
      }

      try {
        const response = await getMe();
        const nextUser = response?.data?.user ?? null;
        if (!cancelled) {
          setUser(nextUser);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      }
    }

    loadUserProfile();
    return () => {
      cancelled = true;
    };
  }, [token, claims?.role]);

  useEffect(() => {
    if (token && !claims) {
      setAuthToken(null);
    }
  }, [token, claims]);

  const setToken = useCallback((nextToken) => {
    setAuthToken(nextToken);
  }, []);

  const signOut = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      userId: claims?.id ?? null,
      role: claims?.role ?? null,
      isAuthenticated: Boolean(token && claims?.role),
      user,
      setToken,
      signOut,
    }),
    [token, claims, user, setToken, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
