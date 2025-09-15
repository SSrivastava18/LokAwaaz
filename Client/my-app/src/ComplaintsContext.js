import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const ComplaintsContext = createContext();

export const ComplaintsProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || null); // ✅ Role state

  // API URL (from env or fallback)
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Global state for complaints
  const [complaints, setComplaints] = useState([]);

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // ✅ Clear role
    setToken("");
    setRole(null);
    setUser(null);
  };

  // Fetch user profile
  const getUserData = async (token) => {
    if (!token) return;
    try {
      const res = await axios.get(`${apiUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      logout();
    }
  };

  // Watch token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      getUserData(token);
    }
  }, [token]);

  // Watch role changes
  useEffect(() => {
    if (role) {
      localStorage.setItem("role", role);
    }
  }, [role]);

  // Fetch complaints from backend on app load
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get(`${apiUrl}/complaints`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.data.success && Array.isArray(res.data.data)) {
          setComplaints(res.data.data);
        } else {
          console.error("Invalid complaints data");
          setComplaints([]);
        }
      } catch (err) {
        console.error("Failed to fetch complaints:", err);
        setComplaints([]);
      }
    };

    fetchComplaints();
  }, [apiUrl, token]);

  // Persist complaints to localStorage as a fallback
  useEffect(() => {
    localStorage.setItem("complaints", JSON.stringify(complaints));
  }, [complaints]);

  const contextVal = {
    complaints,
    setComplaints,
    apiUrl,
    token,
    setToken,
    role,
    setRole, // ✅ Expose role setter
    user,
    setUser,
    getUserData,
    logout,
  };

  return (
    <ComplaintsContext.Provider value={contextVal}>
      {children}
    </ComplaintsContext.Provider>
  );
};
