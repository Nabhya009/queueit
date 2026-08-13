import { createContext } from "react";

// Split out from useAuth.js/AuthProvider.jsx so that each of those files
// exports only one kind of thing (a hook, a component) — mixing them in one
// file breaks Vite's Fast Refresh.
export const AuthContext = createContext(null);
