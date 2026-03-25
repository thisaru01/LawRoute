import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "./authContext";
import { getAuthToken, setAuthToken, subscribeAuthToken } from "./authStorage";
import { parseJwt } from "./jwt";

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getAuthToken());

  useEffect(() => subscribeAuthToken(setTokenState), []);

  const claims = useMemo(() => parseJwt(token), [token]);

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
  }, []);

  const value = useMemo(
    () => ({
      token,
      userId: claims?.id ?? null,
      role: claims?.role ?? null,
      isAuthenticated: Boolean(token && claims?.role),
      setToken,
      signOut,
    }),
    [token, claims, setToken, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
