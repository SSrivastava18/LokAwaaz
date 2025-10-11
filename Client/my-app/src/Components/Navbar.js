import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ComplaintsContext } from "../ComplaintsContext";
import { toast } from "react-toastify";

const Nav = ({ setshowLogin }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, logout, role } = useContext(ComplaintsContext);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleHomeClick = () => {
  // Check if user is currently on government side
  if (location.pathname.startsWith("/gov")) {
    // Logo clicked inside government portal
    navigate("/gov-dashboard");
  } else {
    // Logo clicked on public portal
    navigate("/home");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
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
      className={`fixed top-0 left-0 w-full h-16 flex items-center justify-between px-8 z-50 transition-all duration-300
        ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-md"
            : "bg-white/30 backdrop-blur-sm"
        }`}
    >
      <h1
        onClick={handleHomeClick}
        className="text-2xl font-extrabold text-gray-900 font-serif tracking-wide cursor-pointer"
      >
        Lok<span className="text-blue-600">Awaaz</span>
      </h1>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-gray-800 font-medium">
        <button className="hover:text-blue-600 transition" onClick={handleRegisterComplaintClick}>
          Register Complaint
        </button>
        <button className="hover:text-blue-600 transition" onClick={() => navigate("/view-complaints")}>
          View Complaints
        </button>
        <button className="hover:text-blue-600 transition" onClick={() => navigate("/contact")}>
          Contact
        </button>

        {token ? (
          <>
            <button className="hover:text-blue-600 transition" onClick={() => navigate("/my-complaints")}>
              My Complaints
            </button>

            {/* 🧍 Username display */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full shadow-sm">
              <span className="font-semibold text-blue-700">
                {user?.name || "User"}
              </span>
            </div>

            <button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition">
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => setshowLogin(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md transition"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-3xl text-gray-800"
        onClick={() => setOpen(!open)}
      >
        {open ? "✖" : "☰"}
      </button>

      {/* Mobile Dropdown */}
      {open && (
        <div
          className="absolute top-16 left-0 w-full bg-white/95 backdrop-blur-md flex flex-col items-center gap-4 py-4 md:hidden text-gray-800 font-medium shadow-lg animate-fade-in"
        >
          <button onClick={handleRegisterComplaintClick}>Register Complaint</button>
          <button onClick={() => navigate("/view-complaints")}>View Complaints</button>
          <button onClick={() => navigate("/contact")}>Contact</button>

          {token ? (
            <>
              <button onClick={() => navigate("/my-complaints")}>My Complaints</button>

              {/* 🧍 Username display in mobile */}
              <div className="font-semibold text-blue-700">
                {user?.name || "User"}
              </div>

              <button onClick={handleLogout} className="text-red-500">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => setshowLogin(true)}>Sign In</button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Nav;
