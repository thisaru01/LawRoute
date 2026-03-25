import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthContext } from "./authContext";
import { getAuthToken, setAuthToken, subscribeAuthToken } from "./authStorage";

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getAuthToken());

  useEffect(() => subscribeAuthToken(setTokenState), []);

  const setToken = useCallback((nextToken) => {
    setAuthToken(nextToken);
  }, []);

  const signOut = useCallback(() => {
    setAuthToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      setToken,
      signOut,
    }),
    [token, setToken, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
