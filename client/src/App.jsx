import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";
import RequireAdmin from "./components/RequireAdmin";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import QueuePage from "./pages/QueuePage";
import AdminHomePage from "./pages/AdminHomePage";
import AdminQueuePage from "./pages/AdminQueuePage";

const App = () => (
  <>
    <Navbar />
    <main>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/queues/:id"
          element={
            <RequireAuth>
              <QueuePage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminHomePage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/queues/:id"
          element={
            <RequireAdmin>
              <AdminQueuePage />
            </RequireAdmin>
          }
        />
      </Routes>
    </main>
  </>
);

export default App;
