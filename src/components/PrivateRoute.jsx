// src/components/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../config/firebase";

export default function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  const username = localStorage.getItem("username");

  if (!user) {
    // Not logged in at all
    return <Navigate to="/" replace />;
  }

  if (!username && location.pathname !== "/home") {
    // Logged in but no username selected, allow only Home
    return <Navigate to="/home" replace />;
  }

  return children;
}
