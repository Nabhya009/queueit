import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "../hooks/AuthContext";
import { getMe } from "../services/api";

const AuthProvider = ({ children }) => {
  // Lazy initial state instead of a synchronous setLoading(false) inside the
  // effect below, for the case where there's no token to hydrate at all.
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));
  const [user, setUser] = useState(null);

  // On first load, a token may already be sitting in localStorage from a
  // previous session — try to hydrate the user from it before rendering
  // anything that depends on auth state.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  const loginWithToken = useCallback(async (token) => {
    localStorage.setItem("token", token);
    const me = await getMe();
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
