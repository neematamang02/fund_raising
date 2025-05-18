import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigationbar from "@/components/Navigationbar";
import Home from "@/Pages/Home";
import Donate from "@/Pages/Donate";

function App() {
  return (
    <>
      <Router>
        <Navigationbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/donate" element={<Donate />} />
          </Routes>
        </main>
      </Router>
    </>
  );
}

export default App;
