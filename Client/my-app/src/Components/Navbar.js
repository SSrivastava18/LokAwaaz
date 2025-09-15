import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ComplaintsContext } from "../ComplaintsContext";

const Nav = ({ setshowLogin }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, logout } = useContext(ComplaintsContext); // ✅ get auth state

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavClick = (e, id) => {
    e.preventDefault();
    if (location.pathname === "/") {
      scrollToSection(id);
    } else {
      navigate("/");
      setTimeout(() => scrollToSection(id), 300);
    }
    setOpen(false);
  };

  return (
    <nav className="w-full bg-sky-800 h-20 flex items-center justify-between px-5 text-amber-50 relative">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold font-serif ml-2 md:ml-20">
          LokAwaaz
        </h1>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex justify-between gap-6 text-lg font-semibold font-serif">
        <Link to="/" onClick={(e) => handleNavClick(e, "homeSection")}>
          Home
        </Link>

        <button
          onClick={() => {
            if (token) {
              handleNavClick(new Event("click"), "registerSection");
            } else {
              setshowLogin(true);
            }
          }}
          className="cursor-pointer"
        >
          Register Complaint
        </button>

        <Link to="/contact">Contact</Link>
        <Link to="/about">About</Link>

        {token ? (
          <button onClick={logout}>
            Logout {user?.name ? `(${user.name})` : ""}
          </button>
        ) : (
          <button onClick={() => setshowLogin(true)}>Signup</button>
        )}
      </div>

      {/* Hamburger (mobile) */}
      <button
        className="md:hidden absolute right-5 top-5 text-2xl"
        onClick={() => setOpen(!open)}
      >
        {open ? "✖" : "☰"}
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-20 left-0 w-full bg-sky-700 flex flex-col items-center gap-4 py-4 md:hidden text-lg font-semibold font-serif">
          <Link to="/" onClick={(e) => handleNavClick(e, "homeSection")}>
            Home
          </Link>

          <button
            onClick={() => {
              if (token) {
                handleNavClick(new Event("click"), "registerSection");
              } else {
                setshowLogin(true);
              }
              setOpen(false);
            }}
            className="cursor-pointer"
          >
            Register Complaint
          </button>

          <Link to="/contact" onClick={() => setOpen(false)}>
            Contact
          </Link>
          <Link to="/about" onClick={() => setOpen(false)}>
            About
          </Link>

          {token ? (
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
            >
              Logout {user?.name ? `(${user.name})` : ""}
            </button>
          ) : (
            <button
              onClick={() => {
                setshowLogin(true);
                setOpen(false);
              }}
            >
              Signup
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Nav;
