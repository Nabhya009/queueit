import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "../hooks/AuthContext";
import { getMe } from "../services/api";

const AuthProvider = ({ children }) => {
  // Lazy initial state, so the no-token case never needs a synchronous
  // setLoading(false) inside the effect below.
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));
  const [user, setUser] = useState(null);

  // A token from a previous session may be in localStorage; restore the
  // user from it before anything that depends on auth state renders.
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
