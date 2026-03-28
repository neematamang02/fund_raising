import React, { Suspense, createElement } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import routesConfig from "./routes/routesConfig.jsx";
import { Toaster } from "./components/ui/sonner";
import ScrollToTop from "./components/ScrollToTop";
import AppShell from "./layouts/AppShell";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Toaster position="bottom-right" />
        <AppShell>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-2 border-slate-300 border-t-slate-700 animate-spin" />
              </div>
            }
          >
            <Routes>
              {routesConfig.map(({ path, Component }) => (
                <Route
                  key={path}
                  path={path}
                  element={createElement(Component)}
                />
              ))}
            </Routes>
          </Suspense>
        </AppShell>
      </AuthProvider>
    </Router>
  );
}
