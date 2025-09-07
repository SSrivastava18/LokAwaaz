import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ComplaintsProvider } from "./ComplaintsContext";
import Register from "./pages/Register/Register";
import ViewComplaint from "./pages/ViewComplaint/ViewComplaint";
import Home from "./pages/Home";
import Navbar from "./Components/Navbar";
import ComplaintDetail from "./pages/ComplaintDetail";
import Login from "./Components/Login"; // ✅ import Login modal
import { ToastContainer } from "react-toastify"; // ✅ import Toastify container
import "react-toastify/dist/ReactToastify.css"; // ✅ import Toastify styles

function App() {
  const [showLogin, setShowLogin] = useState(false); // ✅ state to toggle login modal

  return (
    <ComplaintsProvider>
      {/* Navbar with access to open login modal */}
      <div style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}>
        <Navbar setshowLogin={setShowLogin} />
      </div>

      {/* Main Routes */}
      <div style={{ paddingTop: "64px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/view-complaints" element={<ViewComplaint />} />
          <Route path="/complaint/:id" element={<ComplaintDetail />} />
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
