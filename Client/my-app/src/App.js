import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ComplaintsProvider } from "./ComplaintsContext";
import Register from "./pages/Register/Register";
import ViewComplaint from "./pages/ViewComplaint/ViewComplaint";
import Home from "./pages/Home";
import Navbar from "./Components/Navbar";
import ComplaintDetail from "./pages/ComplaintDetail";
import Login from "./Components/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import GovDashboard from "./pages/GovDashboard";
import GovLoginPage from "./Components/GovtLoginPage"; 
import RoleSelectionPage from "./pages/RoleSelectionPage"; 

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  // ✅ Hide navbar on government and role selection pages
  const hideNavbar = location.pathname.startsWith("/gov-") || location.pathname === "/";

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
          <Route path="/view-complaints" element={<ViewComplaint />} />
          <Route path="/complaint/:id" element={<ComplaintDetail />} />

          {/* Government Portal */}
          <Route path="/gov-login" element={<GovLoginPage />} />
          <Route path="/gov-dashboard" element={<GovDashboard />} />
        </Routes>
      </div>

      {showLogin && <Login setshowLogin={setShowLogin} />}

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />
    </ComplaintsProvider>
  );
}

export default App;
