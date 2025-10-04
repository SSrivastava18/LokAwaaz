import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ComplaintsContext } from "../ComplaintsContext";
import { toast } from "react-toastify";

const Nav = ({ setshowLogin }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, logout, role } = useContext(ComplaintsContext);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleHomeClick = () => {
    if (role === "public") {
      if (location.pathname === "/home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/home");
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
      }
    } else if (role === "govt") {
      navigate("/gov-dashboard");
    } else {
      navigate("/home");
    }
    setOpen(false);
  };

  const handleRegisterComplaintClick = () => {
    if (role === "public") {
      if (token) {
        navigate("/home");
        setTimeout(() => scrollToSection("registerSection"), 300);
      } else {
        toast.warning("⚠ Please login first to register a complaint.");
        setshowLogin(true);
      }
    } else if (role === "govt") {
      navigate("/gov-login");
    } else {
      toast.warning("⚠ Please login first to register a complaint.");
      setshowLogin(true);
    }
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out.");
    navigate("/home");
  };

  return (
    <nav
      className="fixed top-0 left-0 w-full h-16 flex items-center justify-between px-6 
      bg-transparent backdrop-blur-sm z-50 text-black"
    >
      {/* Logo */}
      <div>
        <h1
          className="text-2xl font-bold font-serif cursor-pointer"
          onClick={handleHomeClick}
        >
          LokAwaaz
        </h1>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-black font-medium">
        <button onClick={handleRegisterComplaintClick}>
          Register Complaint
        </button>
        <button onClick={() => navigate("/view-complaints")}>
          View Complaints
        </button>
        <button onClick={() => navigate("/contact")}>Contact</button>

        {token ? (
          <>
            <button onClick={() => navigate("/my-complaints")}>
              My Complaints
            </button>
            <button onClick={handleLogout} className="text-red-500">
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => setshowLogin(true)}>Signin</button>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-2xl text-black"
        onClick={() => setOpen(!open)}
      >
        {open ? "✖" : "☰"}
      </button>

      {/* Mobile Menu */}
      {open && (
        <div
          className="absolute top-16 left-0 w-full bg-white/90 backdrop-blur-md 
          flex flex-col items-center gap-4 py-4 md:hidden text-black font-medium shadow-lg"
        >
          <button onClick={handleRegisterComplaintClick}>
            Register Complaint
          </button>
          <button onClick={() => navigate("/view-complaints")}>
            View Complaints
          </button>
          <button onClick={() => navigate("/contact")}>Contact</button>

          {token ? (
            <>
              <button onClick={() => navigate("/my-complaints")}>
                My Complaints
              </button>
              <button onClick={handleLogout} className="text-red-500">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => setshowLogin(true)}>Signin</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Nav;
