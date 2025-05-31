import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigationbar from "@/components/Navigationbar";
import routesConfig from "./routes/routesConfig";
import { UserRoleProvider } from "./Context/UserRoleContext";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <UserRoleProvider>
        <Router>
          <Navigationbar />
          <main className="flex-grow-1 bg-[#F9FAFB]">
            <Routes>
              {routesConfig.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Routes>
          </main>
          <Footer />
        </Router>
      </UserRoleProvider>
    </>
  );
}

export default App;
