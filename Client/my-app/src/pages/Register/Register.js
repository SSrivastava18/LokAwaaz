import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ComplaintsContext } from "../../ComplaintsContext";
import { toast } from "react-toastify";
import "./Register.css";

export default function Register() {
  const { apiUrl, token, setComplaints } = useContext(ComplaintsContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams(); // complaint ID from URL

  const initialData = state?.complaint || null;
  const isEdit = state?.isEdit || Boolean(id);

  const [loading, setLoading] = useState(isEdit && !initialData);
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "Roads");
  const [description, setDescription] = useState(initialData?.description || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [contact, setContact] = useState(initialData?.contact || "");
  const [previews, setPreviews] = useState(
    initialData?.media?.map((m) => ({
      url: m.url,
      type: m.type,
      name: m.filename || "",
      file: null, // existing files don’t have a File object
      existing: true,
      id: m._id,
    })) || []
  );

  // Track removed existing media
  const [removedMediaIds, setRemovedMediaIds] = useState([]);

  // Fetch complaint if editing and no initialData
  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id || initialData) return;
      try {
        const res = await fetch(`${apiUrl}/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const c = data.data;
          setTitle(c.title);
          setCategory(c.category);
          setDescription(c.description);
          setLocation(c.location);
          setContact(c.contactInfo || "");
          setPreviews(
            c.media?.map((m) => ({
              url: m.url,
              type: m.type,
              name: m.filename || "",
              file: null,
              existing: true,
              id: m._id,
            })) || []
          );
        } else {
          toast.error("Failed to fetch complaint details.");
          navigate("/my-complaints");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error fetching complaint details.");
        navigate("/my-complaints");
      } finally {
        setLoading(false);
      }
    };

    if (isEdit) fetchComplaint();
  }, [id, initialData, apiUrl, token, navigate, isEdit]);

  // Handle new file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const filePreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
      name: file.name,
      existing: false,
    }));
    setPreviews((prev) => [...prev, ...filePreviews]);
  };

  // Remove a file (existing or new)
  const removeFile = (index) => {
    const file = previews[index];
    if (file.existing && file.id) {
      setRemovedMediaIds((prev) => [...prev, file.id]); // mark for backend deletion
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Use current geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setLocation(data.display_name || `${latitude}, ${longitude}`);
        } catch {
          setLocation(`${latitude}, ${longitude}`);
        }
      },
      () => toast.error("Unable to fetch location")
    );
  };

  // Submit form (add or edit)
  const handleSubmit = async () => {
    if (!title || !location) {
      toast.warning("Please enter at least a title and location");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("contact", contact);

    // Append new files only
    previews.forEach((fileObj) => {
      if (!fileObj.existing && fileObj.file) formData.append("media", fileObj.file);
    });

    // Send IDs of removed media to backend
    formData.append("removedMediaIds", JSON.stringify(removedMediaIds));

    try {
      const url = isEdit ? `${apiUrl}/complaints/${id}` : `${apiUrl}/complaints`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        toast.success(isEdit ? "Complaint updated successfully!" : "Complaint registered successfully!");
        if (isEdit) {
          // Update the complaints state in context
          setComplaints((prev) =>
            prev.map((c) => (c._id === data.complaint._id ? data.complaint : c))
          );
          navigate("/my-complaints");
        } else {
          setComplaints((prev) => [data.complaint, ...prev]);
          navigate("/view-complaints");
        }
      } else {
        toast.error("❌ Failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while submitting complaint.");
    }
  };

  if (loading) return <p className="text-center mt-6">Loading complaint data...</p>;

  return (
    <div className="container">
      <div className="main">
        <div className="form-card">
          <h2>{isEdit ? "Edit Complaint" : "Register Your Complaint"}</h2>

          <label>
            <span>Complaint Title</span>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label>
            <span>Complaint Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Roads</option>
              <option>Water Supply</option>
              <option>Electricity</option>
              <option>Sanitation</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            <span>Complaint Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>

          <label className="location-row">
            <span>Location</span>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
            <button type="button" onClick={handleUseMyLocation}>Use My Location</button>
          </label>

          <label>
            <span>Preferred Contact Info</span>
            <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} />
          </label>

          <label>
            <span>Upload Images/Videos</span>
            <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} />
          </label>

          <div className="upload-preview">
            {previews.map((file, index) => (
              <div key={index} className="preview-item">
                {file.type === "video" ? (
                  <video src={file.url} controls className="preview" />
                ) : (
                  <img src={file.url} alt="uploaded" className="preview" />
                )}
                <button type="button" className="remove-btn" onClick={() => removeFile(index)}>❌</button>
              </div>
            ))}
          </div>

          <button className="submit-btn" type="button" onClick={handleSubmit}>
            {isEdit ? "Update Complaint" : "Submit Complaint"}
          </button>
        </div>
      </div>
    </div>
  );
}
