import React, { useState, useEffect } from 'react';
import '../styles/AdminPanel.css';

function EditDataModal({ isOpen, onClose, activeTab, itemToEdit, onSuccess }) {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
        if (itemToEdit) setFormData(itemToEdit);
    }, [itemToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await fetch(`/api/admin/${activeTab}/${itemToEdit.id || itemToEdit._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to update item');
            onSuccess();
        } catch (err) {
            setError(err.message);
        }
    };

    if (!isOpen) return null;

  
    const renderUserFields = () => (
        <>
            <input name="username" placeholder="Username" value={formData.username || ''} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" value={formData.email || ''} onChange={handleChange} required />
            <select name="role" value={formData.role || 'client'} onChange={handleChange}>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
            </select>
        </>
    );

    const renderPlaceFields = () => (
        <>
            <input name="name" placeholder="Place Name" value={formData.name || ''} onChange={handleChange} required />
            <input name="description" placeholder="Description" value={formData.description || ''} onChange={handleChange} />
            <input name="location" placeholder="Location" value={formData.location || ''} onChange={handleChange} />
            <input name="latitude" type="number" step="any" placeholder="Latitude" value={formData.latitude || ''} onChange={handleChange} />
            <input name="longitude" type="number" step="any" placeholder="Longitude" value={formData.longitude || ''} onChange={handleChange} />
            <input name="image" placeholder="Image URL" value={formData.image || ''} onChange={handleChange} />
            <input name="rating" type="number" step="0.1" placeholder="Rating" value={formData.rating || ''} onChange={handleChange} />
            <input name="category_id" type="number" placeholder="Category ID" value={formData.category_id || ''} onChange={handleChange} />
        </>
    );

    const renderCategoryFields = () => (
        <>
            <input name="name" placeholder="Category Name" value={formData.name || ''} onChange={handleChange} required />
            <input name="image" placeholder="Image URL" value={formData.image || ''} onChange={handleChange} />
        </>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>&times;</button>
                <h3>Edit {activeTab.slice(0, -1)}</h3>
                <form className="add-data-form" onSubmit={handleSubmit}>
                    {activeTab === 'users' && renderUserFields()}
                    {activeTab === 'places' && renderPlaceFields()}
                    {activeTab === 'categories' && renderCategoryFields()}
                    {error && <p className="error-text">{error}</p>}
                    <button type="submit" className="submit-btn">Save Changes</button>
                </form>
            </div>
        </div>
    );
}

export default EditDataModal;
