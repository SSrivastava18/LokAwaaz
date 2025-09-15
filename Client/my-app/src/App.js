import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ComplaintsProvider } from "./ComplaintsContext";
import Register from "./pages/Register/Register";
import ViewComplaint from "./pages/ViewComplaint/ViewComplaint";
import Home from "./pages/Home";
import Navbar from "./Components/Navbar";
import ComplaintDetail from "./pages/ComplaintDetail";
import Login from "./Components/Login"; // ✅ import Login modal
import { ToastContainer } from "react-toastify"; // ✅ import Toastify container
import "react-toastify/dist/ReactToastify.css"; // ✅ import Toastify styles

// ✅ Import Government Dashboard
import GovDashboard from "./pages/GovDashboard";

function App() {
  const [showLogin, setShowLogin] = useState(false); 
  const location = useLocation(); // ✅ detect current path

  const hideNavbar = location.pathname === "/gov-dashboard"; // ✅ condition

  return (
    <ComplaintsProvider>
      {/* ✅ Only show Navbar if not on gov dashboard */}
      {!hideNavbar && (
        <div style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}>
          <Navbar setshowLogin={setShowLogin} />
        </div>
      )}

      {/* Main Routes */}
      <div style={{ paddingTop: hideNavbar ? "0px" : "64px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/view-complaints" element={<ViewComplaint />} />
          <Route path="/complaint/:id" element={<ComplaintDetail />} />

          {/* ✅ Government side (no Navbar here) */}
          <Route path="/gov-dashboard" element={<GovDashboard />} />
        </Routes>
      </div>

      {/* Show login modal if state is true */}
      {showLogin && <Login setshowLogin={setShowLogin} />}

      {/* ✅ Toastify container for global toasts */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
    </ComplaintsProvider>
  );
}

export default App;
