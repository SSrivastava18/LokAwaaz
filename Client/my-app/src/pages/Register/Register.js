import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ComplaintsContext } from "../../ComplaintsContext";
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
      file, // Store original File object
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
      name: file.name,
    }));
    setPreviews((prev) => [...prev, ...filePreviews]);
  };

  const removeFile = (index) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !location) {
      alert("Please enter at least a title and location");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("contact", contact);

    previews.forEach((fileObj) => {
      formData.append("media", fileObj.file); // Append each file
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
        alert("✅ Complaint registered successfully");

        // Update global context with the new complaint
        setComplaints((prev) => [data.complaint, ...prev]);

        navigate("/view-complaints");
      } else {
        alert("❌ Failed to register complaint: " + data.message);
      }
    } catch (err) {
      console.error("❌ Error submitting complaint:", err);
      alert("An error occurred while submitting complaint.");
    }
  };

  return (
    <div className="container">
      <div className="main">
        {/* Complaint Form */}
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
            <button className="location-btn" type="button">
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

          {/* Preview Thumbnails */}
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

        {/* Tips Section */}
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
