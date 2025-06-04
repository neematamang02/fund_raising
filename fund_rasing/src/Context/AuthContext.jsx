import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  switchRole: async () => {},
  loading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Save token in localStorage & state
  const saveToken = (jwt) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
  };

  // Clear session
  const clearSession = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Fetch current user using stored token
  const fetchCurrentUser = async (jwt) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser(data);
    } catch {
      clearSession();
    }
  };

  // Called once on mount to see if token already exists
  useEffect(() => {
    const existingToken = localStorage.getItem("token");
    if (existingToken) {
      saveToken(existingToken);
      fetchCurrentUser(existingToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // A helper to set token + fetch user, without needing email/password again
  const setTokenAndFetchUser = async (jwt) => {
    saveToken(jwt);
    await fetchCurrentUser(jwt);
  };

  // The old login(email, password) can remain if you still need it elsewhere:
  const login = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Login failed");
      }
      const { token: jwt } = await res.json();
      await setTokenAndFetchUser(jwt);
      return true;
    } catch {
      return false;
    }
  };
  const switchRole = async (newRole) => {
    if (!token) return false;
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      // Update just the role in the `user` object we already have:
      setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        setTokenAndFetchUser,
        switchRole,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
