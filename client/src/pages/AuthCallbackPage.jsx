import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState(null);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      return;
    }
    loginWithToken(token)
      .then(() => navigate("/"))
      .catch(() => setError("Could not sign you in. Please try again."));
  }, [token, loginWithToken, navigate]);

  if (!token) {
    return (
      <div className="page centered">
        <p className="error-message">No token received from the server.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page centered">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="page centered">
      <p className="status-message">Signing you in...</p>
    </div>
  );
};

export default AuthCallbackPage;
