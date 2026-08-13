import { useSearchParams } from "react-router-dom";
import { googleLoginUrl } from "../services/api";

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const hasError = searchParams.get("error") === "1";

  return (
    <div className="page centered">
      <h1>Sign in to QueueIt</h1>
      {hasError && <p className="error-message">Google sign-in failed. Please try again.</p>}
      {/* Full page navigation, not client-side routing: the backend needs to
          redirect the browser to Google's own consent screen. */}
      <a className="button" href={googleLoginUrl}>
        Sign in with Google
      </a>
    </div>
  );
};

export default LoginPage;
