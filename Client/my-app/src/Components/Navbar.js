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
      navigate("/home");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
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
      navigate("/home");
    }
    setOpen(false);
  };

  return (
    <nav className="w-full bg-sky-800 h-20 flex items-center justify-between px-5 text-amber-50 relative">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold font-serif ml-2 md:ml-20">
          LokAwaaz
        </h1>
      </div>

      <div className="hidden md:flex justify-between gap-6 text-lg font-semibold font-serif">
        <button onClick={handleHomeClick} className="cursor-pointer">
          Home
        </button>

        <button onClick={handleRegisterComplaintClick} className="cursor-pointer">
          Register Complaint
        </button>

        <button onClick={() => navigate("/contact")}>
          Contact
        </button>

        <button onClick={() => navigate("/about")}>
          About
        </button>

        {token ? (
          <button onClick={logout}>
            Logout {user?.name ? `(${user.name})` : ""}
          </button>
        ) : (
          <button onClick={() => setshowLogin(true)}>Signup</button>
        )}
      </div>

      <button
        className="md:hidden absolute right-5 top-5 text-2xl"
        onClick={() => setOpen(!open)}
      >
        {open ? "✖" : "☰"}
      </button>

      {open && (
        <div className="absolute top-20 left-0 w-full bg-sky-700 flex flex-col items-center gap-4 py-4 md:hidden text-lg font-semibold font-serif">
          <button onClick={handleHomeClick} className="cursor-pointer">
            Home
          </button>

          <button onClick={handleRegisterComplaintClick} className="cursor-pointer">
            Register Complaint
          </button>

          <button onClick={() => { navigate("/contact"); setOpen(false); }}>
            Contact
          </button>

          <button onClick={() => { navigate("/about"); setOpen(false); }}>
            About
          </button>

          {token ? (
            <button onClick={() => { logout(); setOpen(false); }}>
              Logout {user?.name ? `(${user.name})` : ""}
            </button>
          ) : (
            <button onClick={() => { setshowLogin(true); setOpen(false); }}>
              Signup
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Nav;
