import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import Navigationbar from "./components/Navigationbar";

import Footer from "./components/Footer";
import routesConfig from "./routes/routesConfig.jsx";
import { Toaster } from "./components/ui/sonner";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Navigationbar />
        <ScrollToTop />

        <main className="bg-[#F9FAFB] min-h-screen">
          <Toaster position="bottom-right" />
          <Routes>
            {routesConfig.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Routes>
        </main>

        <Footer />
      </AuthProvider>
    </Router>
  );
}
