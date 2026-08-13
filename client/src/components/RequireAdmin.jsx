import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const RequireAdmin = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="status-message">Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default RequireAdmin;
