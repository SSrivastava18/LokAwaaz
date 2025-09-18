import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ComplaintsContext } from "../ComplaintsContext";
import { toast } from "react-toastify";

const Nav = ({ setshowLogin }) => {
  const [open, setOpen] = useState(false); // mobile menu
  const [dropdownOpen, setDropdownOpen] = useState(false); // user dropdown
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
        setTimeout(() => {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 300);
      } else {
        navigate("/home");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 300);
      }
    } else if (role === "govt") {
      navigate("/gov-dashboard");
    } else {
      if (location.pathname === "/home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate("/home");
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
      }
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
    toast.success(
      user?.name
        ? `✅ ${user.name}, you have been logged out.`
        : "✅ You have been logged out."
    );
    navigate("/home");
  };

  return (
    <nav className="w-full bg-sky-800 h-20 flex items-center justify-between px-5 text-amber-50 relative">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold font-serif ml-2 md:ml-20">
          LokAwaaz
        </h1>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6 text-lg font-semibold font-serif">
        <button onClick={handleHomeClick} className="cursor-pointer">
          Home
        </button>

        <button
          onClick={handleRegisterComplaintClick}
          className="cursor-pointer"
        >
          Register Complaint
        </button>

        <button onClick={() => navigate("/contact")}>Contact</button>
        <button onClick={() => navigate("/about")}>About</button>

        {/* If logged in → show user dropdown */}
        {token ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 cursor-pointer"
            >
              Hi, {user?.name || "User"} <span>▼</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    navigate("/my-complaints");
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  My Complaints
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={() => setshowLogin(true)}>Signup</button>
        )}
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden absolute right-5 top-5 text-2xl"
        onClick={() => setOpen(!open)}
      >
        {open ? "✖" : "☰"}
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-20 left-0 w-full bg-sky-700 flex flex-col items-center gap-4 py-4 md:hidden text-lg font-semibold font-serif">
          <button onClick={handleHomeClick} className="cursor-pointer">
            Home
          </button>

          <button
            onClick={handleRegisterComplaintClick}
            className="cursor-pointer"
          >
            Register Complaint
          </button>

          <button
            onClick={() => {
              navigate("/contact");
              setOpen(false);
            }}
          >
            Contact
          </button>

          <button
            onClick={() => {
              navigate("/about");
              setOpen(false);
            }}
          >
            About
          </button>

          {token ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-white">Hi, {user?.name || "User"}</span>
              <button
                onClick={() => {
                  navigate("/my-complaints");
                  setOpen(false);
                }}
                className="block px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100"
              >
                My Complaints
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
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
