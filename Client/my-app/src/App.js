import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ComplaintsProvider } from "./ComplaintsContext";
import Register from "./pages/Register/Register";
import ViewComplaint from "./pages/ViewComplaint/ViewComplaint";
import Home from "./pages/Home";
import Navbar from "./Components/Navbar";
import ComplaintDetail from "./pages/ComplaintDetail";
import Login from "./Components/Login";
import MyComplaints from "./pages/MyComplaints";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import GovDashboard from "./pages/GovDashboard";
import GovLoginPage from "./Components/GovtLoginPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  // Hide navbar for role selection or government routes
  const hideNavbar = location.pathname.startsWith("/gov-") || location.pathname === "/";

  // Auto-close login modal on route change
  useEffect(() => {
    setShowLogin(false);
  }, [location.pathname]);

  return (
    <ComplaintsProvider>
      {!hideNavbar && (
        <div style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}>
          <Navbar setshowLogin={setShowLogin} />
        </div>
      )}

      <div style={{ paddingTop: hideNavbar ? "0px" : "64px" }}>
        <Routes>
          {/* Role selection landing page */}
          <Route path="/" element={<RoleSelectionPage />} />

          {/* Public Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/edit-complaint/:id" element={<Register />} /> {/* ✅ Added */}
          <Route path="/view-complaints" element={<ViewComplaint />} />
          <Route path="/complaint/:id" element={<ComplaintDetail />} />

          {/* User Routes */}
          <Route path="/my-complaints" element={<MyComplaints />} />

          {/* Government Portal */}
          <Route path="/gov-login" element={<GovLoginPage />} />
          <Route path="/gov-dashboard" element={<GovDashboard />} />

          {/* 404 Fallback */}
          <Route path="*" element={<p className="text-center p-6"></p>} />
        </Routes>
      </div>

      {showLogin && <Login setshowLogin={setShowLogin} />}

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
    </ComplaintsProvider>
  );
}

export default App;
