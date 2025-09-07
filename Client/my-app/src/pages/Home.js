import React from "react";
import ViewComplaints from "./ViewComplaint/ViewComplaint";
import Register from "./Register/Register";

const Home = () => {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      {/* First Section (Hero) */}
      <div
        id="homeSection"
        className="relative w-full h-screen snap-start scroll-mt-20"
      >
        <img
          className="w-full h-full object-cover absolute inset-0 -z-10"
          src="nayaakBg.png"
          alt="BG"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col sm:flex-row gap-4 mt-80">
            {/* Scroll to Register Section */}
            <button
              className="bg-blue-950 px-6 py-3 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-900"
              onClick={() =>
                document.getElementById("registerSection").scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Report an Issue
            </button>

            {/* Scroll to Complaints Section */}
            <button
              className="bg-gray-200 px-6 py-3 text-blue-950 text-lg font-semibold rounded-lg shadow-lg hover:bg-gray-300"
              onClick={() =>
                document.getElementById("complaintsSection").scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Track a Report
            </button>
          </div>
        </div>
      </div>

      {/* Second Section (Complaints) */}
      <div
        id="complaintsSection"
        className="w-full h-screen bg-gray-50 snap-start scroll-mt-20"
      >
        <ViewComplaints />
      </div>

      {/* Third Section (Register Complaint) */}
      <div
        id="registerSection"
        className="w-full min-h-screen bg-white snap-start scroll-mt-20"
      >
        <Register />
      </div>
    </div>
  );
};

export default Home;


