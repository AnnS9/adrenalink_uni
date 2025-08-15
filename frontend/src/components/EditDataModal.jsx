import React, { useState, useEffect } from 'react';
import '../styles/AdminPanel.css';

function EditDataModal({ isOpen, onClose, activeTab, itemToEdit, onSuccess }) {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(null);

    // This effect pre-fills the form with the item's data when the modal opens
    useEffect(() => {
        if (itemToEdit) {
            setFormData(itemToEdit);
        }
    }, [itemToEdit]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await fetch(`/api/admin/${activeTab}/${itemToEdit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to update the item.');
            }
            onSuccess();
        } catch (err) {
            setError(err.message);
        }
    };

    if (!isOpen) return null;

    // The renderFormFields function would be here, similar to your AddDataModal,
    // but using `value={formData.fieldName}` for each input to show the current data.
    // For example:
    const renderUserFields = () => (
        <>
            <input name="username" value={formData.username || ''} placeholder="Username" onChange={handleChange} required />
            <input name="email" type="email" value={formData.email || ''} placeholder="Email" onChange={handleChange} required />
            <select name="role" value={formData.role || 'client'} onChange={handleChange}>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
            </select>
        </>
    );


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}>&times;</button>
                <h3>Edit {activeTab.slice(0, -1)}</h3>
                <form className="add-data-form" onSubmit={handleSubmit}>
                    {/* Based on activeTab, render the correct set of fields */}
                    {activeTab === 'users' && renderUserFields()}
                    {/* Add similar render functions for places and categories */}
                    
                    {error && <p className="error-text">{error}</p>}
                    <button type="submit" className="submit-btn">Save Changes</button>
                </form>
            </div>
        </div>
    );
}

export default EditDataModal;