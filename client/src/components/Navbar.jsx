import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        QueueIt
      </Link>
      <div className="navbar-actions">
        {user ? (
          <>
            {user.role === "admin" && <Link to="/admin">Admin</Link>}
            <span className="navbar-user">
              {user.name} ({user.role})
            </span>
            <button type="button" onClick={logout}>
              Sign out
            </button>
          </>
        ) : (
          <Link to="/login">Sign in</Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
