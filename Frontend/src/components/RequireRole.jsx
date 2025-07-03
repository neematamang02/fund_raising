import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/AuthContext";

export default function RequireRole({ role, children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // While AuthContext is still loading, don’t render anything yet
  if (loading) {
    return null;
  }

  // If not logged in, redirect to login, preserving the current path in `redirect`
  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // If the user’s role does not match, take them back to home
  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the protected component(s)
  return <>{children}</>;
}
