import React, { useState, useEffect } from "react";
import "../styles/AdminPanel.css";
import { apiSend } from "../lib/api";

function EditDataModal({ isOpen, onClose, activeTab, itemToEdit, onSuccess }) {
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    setSubmitting(false);
    if (itemToEdit) setFormData(itemToEdit);
    else setFormData({});
  }, [itemToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let v = value;
    if (type === "number" && value !== "") v = Number(value);
    setFormData((prev) => ({ ...prev, [name]: v }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const id = itemToEdit?.id ?? itemToEdit?._id;
      if (!id) throw new Error("Item ID is missing");

      setSubmitting(true);

     
      const path = `/api/admin/${activeTab}/${id}`;

     
      await apiSend(path, "PUT", formData);

      setSubmitting(false);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setSubmitting(false);
      setError(err?.message || "Failed to update item");
    }
  };

  if (!isOpen) return null;

  const renderUserFields = () => (
    <>
      <input
        name="username"
        placeholder="Username"
        value={formData.username || ""}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email || ""}
        onChange={handleChange}
        required
      />
      <select name="role" value={formData.role || "client"} onChange={handleChange}>
        <option value="client">Client</option>
        <option value="admin">Admin</option>
      </select>
    </>
  );

  const renderPlaceFields = () => (
    <>
      <input
        name="name"
        placeholder="Place Name"
        value={formData.name || ""}
        onChange={handleChange}
        required
      />
      <input
        name="description"
        placeholder="Description"
        value={formData.description || ""}
        onChange={handleChange}
      />
      <input
        name="location"
        placeholder="Location"
        value={formData.location || ""}
        onChange={handleChange}
      />
      <input
        name="latitude"
        type="number"
        step="any"
        placeholder="Latitude"
        value={formData.latitude ?? ""}
        onChange={handleChange}
      />
      <input
        name="longitude"
        type="number"
        step="any"
        placeholder="Longitude"
        value={formData.longitude ?? ""}
        onChange={handleChange}
      />
      <input
        name="image"
        placeholder="Image URL"
        value={formData.image || ""}
        onChange={handleChange}
      />
      <input
        name="rating"
        type="number"
        step="0.1"
        placeholder="Rating"
        value={formData.rating ?? ""}
        onChange={handleChange}
      />
      <input
        name="category_id"
        type="number"
        placeholder="Category ID"
        value={formData.category_id ?? ""}
        onChange={handleChange}
      />
    </>
  );

  const renderCategoryFields = () => (
    <>
      <input
        name="name"
        placeholder="Category Name"
        value={formData.name || ""}
        onChange={handleChange}
        required
      />
      <input
        name="image"
        placeholder="Image URL"
        value={formData.image || ""}
        onChange={handleChange}
      />
    </>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          &times;
        </button>
        <h3>Edit {activeTab?.slice(0, -1) || "item"}</h3>

        <form className="add-data-form" onSubmit={handleSubmit}>
          {activeTab === "users" && renderUserFields()}
          {activeTab === "places" && renderPlaceFields()}
          {activeTab === "categories" && renderCategoryFields()}

          {error && <p className="error-text">Error: {error}</p>}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditDataModal;
