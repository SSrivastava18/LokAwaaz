import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    localStorage.setItem("role", role);

    if (role === "public") {
      navigate("/home"); // Redirect to public home page
    } else if (role === "govt") {
      navigate("/gov-login"); // Redirect to government login page
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-6">Select Your Role</h1>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleSelectRole("public")}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
          >
            Public
          </button>
          <button
            onClick={() => handleSelectRole("govt")}
            className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition"
          >
            Government
          </button>
        </div>
      </div>
    </div>
  );
}
