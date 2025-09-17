import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ComplaintsContext } from "../../ComplaintsContext";
import { toast } from "react-toastify";
import "./Register.css";

export default function Register() {
  const { apiUrl, token, setComplaints } = useContext(ComplaintsContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Roads");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const filePreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
      name: file.name,
    }));
    setPreviews((prev) => [...prev, ...filePreviews]);
  };

  const removeFile = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("❌ Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          const address =
            data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

          setLocation(address);
          toast.success("📍 Location fetched successfully!");
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          toast.info("📍 Location coordinates fetched (no address).");
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("❌ Unable to fetch location. Please allow location access.");
      }
    );
  };

  const handleSubmit = async () => {
    if (!title || !location) {
      toast.warning("⚠️ Please enter at least a title and location");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("contact", contact);

    previews.forEach((fileObj) => {
      formData.append("media", fileObj.file);
    });

    try {
      const res = await fetch(`${apiUrl}/complaints`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Complaint registered successfully!");
        setComplaints((prev) => [data.complaint, ...prev]);
        navigate("/view-complaints");
      } else {
        toast.error("❌ Failed to register complaint: " + data.message);
      }
    } catch (err) {
      console.error("❌ Error submitting complaint:", err);
      toast.error("An error occurred while submitting complaint.");
    }
  };

  return (
    <div className="container">
      <div className="main">
        <div className="form-card">
          <h2>Register Your Complaint</h2>

          <label>
            <span>Complaint Title</span>
            <input
              type="text"
              placeholder="E.g. Pothole on Main Road"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label>
            <span>Complaint Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Roads</option>
              <option>Water Supply</option>
              <option>Electricity</option>
              <option>Sanitation</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            <span>Complaint Description</span>
            <textarea
              placeholder="Describe your issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className="location-row">
            <span>Location</span>
            <input
              type="text"
              placeholder="Enter your location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button
              className="location-btn"
              type="button"
              onClick={handleUseMyLocation}
            >
              Use My Location
            </button>
          </label>

          <label>
            <span>Preferred Contact Info</span>
            <input
              type="text"
              placeholder="Email / Mobile No."
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </label>

          <label>
            <span>Upload Images/Videos</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
            />
          </label>

          <div className="upload-preview">
            {previews.map((file, index) => (
              <div key={index} className="preview-item">
                {file.type === "video" ? (
                  <video src={file.url} controls className="preview" />
                ) : (
                  <img src={file.url} alt="uploaded" className="preview" />
                )}
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeFile(index)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          <button className="submit-btn" type="button" onClick={handleSubmit}>
            Submit Complaint
          </button>
        </div>

       
        <div className="tips-card">
          <h3>Tips for registering complaint</h3>
          <ul>
            <li>Upload clear photos/videos</li>
            <li>Provide exact location</li>
            <li>Use polite & clear language</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
