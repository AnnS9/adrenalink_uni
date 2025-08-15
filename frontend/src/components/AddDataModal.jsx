import React, { useState, useEffect } from 'react';
import '../styles/AdminPanel.css';

const defaultData = {
  users: {
    username: '',
    email: '',
    password: '',
    role: 'client'
  },
  places: {
    name: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    image: '',
    rating: '',
    category_id: ''
  },
  categories: {
    name: '',
    description: '',
    image: ''
  }
};

function AddDataModal({ isOpen, onClose, activeTab, onSuccess }) {
  const [formData, setFormData] = useState(defaultData[activeTab]);
  const [error, setError] = useState(null);

  /* ------------------------------------------------------------------
   * Reset the form every time the modal opens or the tab changes
   * ------------------------------------------------------------------ */
  useEffect(() => {
    if (isOpen) setFormData(defaultData[activeTab]);
  }, [isOpen, activeTab]);

  /* ------------------------------------------------------------------
   * Generic change handler
   * ------------------------------------------------------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ------------------------------------------------------------------
   * Submit handler
   * ------------------------------------------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // choose /api/admin/users | places | categories
    const endpoint = `/api/admin/${activeTab}`;

    // cast number‑like fields for places
    let payload = { ...formData };
    if (activeTab === 'places') {
      payload = {
        ...payload,
        rating: payload.rating ? Number(payload.rating) : null,
        latitude: payload.latitude ? Number(payload.latitude) : null,
        longitude: payload.longitude ? Number(payload.longitude) : null,
        category_id: Number(payload.category_id)
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to add item');

      onSuccess();           // refresh table in parent
      setFormData(defaultData[activeTab]); // clear form
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  /* ------------------------------------------------------------------
   * Render tab‑specific fields
   * ------------------------------------------------------------------ */
  const renderFields = () => {
    switch (activeTab) {
      case 'users':
        return (
          <>
            <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </>
        );

      case 'places':
        return (
          <>
            <input name="name" placeholder="Place Name" value={formData.name} onChange={handleChange} required />
            <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
            <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
            <input name="latitude" type="number" step="any" placeholder="Latitude" value={formData.latitude} onChange={handleChange} />
            <input name="longitude" type="number" step="any" placeholder="Longitude" value={formData.longitude} onChange={handleChange} />
            <input name="image" placeholder="Image URL" value={formData.image} onChange={handleChange} />
            <input name="rating" type="number" step="0.1" placeholder="Rating (e.g., 4.5)" value={formData.rating} onChange={handleChange} />
            <input name="category_id" type="number" placeholder="Category ID" value={formData.category_id} onChange={handleChange} required />
          </>
        );

      case 'categories':
        return (
          <>
            <input name="name" placeholder="Category Name" value={formData.name} onChange={handleChange} required />
            <input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
            <input name="image" placeholder="Image URL" value={formData.image} onChange={handleChange} />
          </>
        );

      default:
        return null;
    }
  };

  /* ------------------------------------------------------------------ */
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        <h3>Add New {activeTab.slice(0, -1)}</h3>

        <form className="add-data-form" onSubmit={handleSubmit}>
          {renderFields()}
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default AddDataModal;
