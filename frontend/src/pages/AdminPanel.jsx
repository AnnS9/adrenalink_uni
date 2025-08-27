import React, { useState, useEffect, useCallback } from 'react';
import '../styles/AdminPanel.css'; 
import AddDataModal from '../components/AddDataModal';

function AdminPanel() {
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/${activeTab}`, { credentials: 'include' });
            if (!response.ok) throw new Error(`Failed to load data. Status: ${response.status}`);
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        fetchData(); 
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        fetchData(); 
    };

    const openEditModal = (item) => {
        setCurrentItem(item);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (itemId) => {
        if (window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
            try {
                const response = await fetch(`/api/admin/${activeTab}/${itemId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (!response.ok) throw new Error('Failed to delete item.');
                fetchData(); 
            } catch (err) {
                setError(err.message);
            }
        }
    };
    
    const renderTableHeaders = () => {
        switch (activeTab) {
            case 'users':
                return (
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                );
            case 'places':
                return (
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Rating</th>
                        <th>Image</th>
                        <th>Category</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                );
            case 'categories':
                return (
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Actions</th>
                    </tr>
                );
            default:
                return null;
        }
    };

    const renderTableRows = () => {
        if (!data || data.length === 0) {
            const colSpan = activeTab === 'places' ? 10 : activeTab === 'users' ? 5 : 3;
            return <tr><td colSpan={colSpan}>No data available.</td></tr>;
        }

        return data.map(item => (
            <tr key={item.id || item._id}>
                {activeTab === 'users' && <>
                    <td>{item.id || item._id}</td>
                    <td>{item.email}</td>
                    <td>{item.username}</td>
                    <td>{item.role}</td>
                </>}
                {activeTab === 'places' && <>
                    <td>{item.id || item._id}</td>
                    <td>{item.name}</td>
                    <td>{item.location}</td>
                    <td>{item.rating}</td>
                    <td>{item.image ? <img src={item.image} alt={item.name} className="table-image" /> : 'N/A'}</td>
                    <td>{item.category_id || 'N/A'}</td>
                    <td>{item.latitude || 'N/A'}</td>
                    <td>{item.longitude || 'N/A'}</td>
                    <td>{item.description || 'N/A'}</td>
                </>}
                {activeTab === 'categories' && <>
                    <td>{item.id || item._id}</td>
                    <td>{item.name}</td>
                </>}
                <td>
                    <button className="edit-btn" onClick={() => openEditModal(item)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(item.id || item._id)}>Delete</button>
                </td>
            </tr>
        ));
    };

    return (
        <div className="admin-panel-container">
            <h1 className="admin-title">Admin Panel</h1>
            <div className="admin-tabs">
                <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>Manage Users</button>
                <button onClick={() => setActiveTab('places')} className={activeTab === 'places' ? 'active' : ''}>Manage Places</button>
                <button onClick={() => setActiveTab('categories')} className={activeTab === 'categories' ? 'active' : ''}>Manage Categories</button>
            </div>

            <div className="admin-actions">
                <button className="add-new-btn" onClick={() => setIsAddModalOpen(true)}>
                    + Add New {activeTab.slice(0, -1)}
                </button>
            </div>
            
            <div className="admin-content">
                {loading && <p>Loading...</p>}
                {error && <p className="error-message">{error}</p>}
                {!loading && !error && (
                    <table>
                        <thead>{renderTableHeaders()}</thead>
                        <tbody>{renderTableRows()}</tbody>
                    </table>
                )}
            </div>

            {isAddModalOpen && (
                <AddDataModal 
                    isOpen={isAddModalOpen} 
                    onClose={() => setIsAddModalOpen(false)} 
                    activeTab={activeTab} 
                    onSuccess={handleAddSuccess} 
                />
            )}

            {isEditModalOpen && (
                <EditDataModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    activeTab={activeTab} 
                    itemToEdit={currentItem} 
                    onSuccess={handleEditSuccess} 
                />
            )}
        </div>
    );
}

/*   EditDataModal */
function EditDataModal({ isOpen, onClose, activeTab, itemToEdit, onSuccess }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (itemToEdit) setFormData(itemToEdit);
    }, [itemToEdit]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch(`/api/admin/${activeTab}/${itemToEdit.id || itemToEdit._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Failed to update item");
            onSuccess();
        } catch (err) {
            alert(err.message);
        }
    };

    const renderFields = () => {
        switch (activeTab) {
            case "users":
                return (
                    <>
                        <label>Email</label>
                        <input name="email" value={formData.email || ""} onChange={handleChange} />

                        <label>Username</label>
                        <input name="username" value={formData.username || ""} onChange={handleChange} />

                        <label>Role</label>
                        <input name="role" value={formData.role || ""} onChange={handleChange} />
                    </>
                );
            case "places":
                return (
                    <>
                        <label>Name</label>
                        <input name="name" value={formData.name || ""} onChange={handleChange} />

                        <label>Location</label>
                        <input name="location" value={formData.location || ""} onChange={handleChange} />

                        <label>Rating</label>
                        <input name="rating" type="number" value={formData.rating || ""} onChange={handleChange} />

                        <label>Image URL</label>
                        <input name="image" value={formData.image || ""} onChange={handleChange} />

                        <label>Category ID</label>
                        <input name="category_id" value={formData.category_id || ""} onChange={handleChange} />

                        <label>Latitude</label>
                        <input name="latitude" value={formData.latitude || ""} onChange={handleChange} />

                        <label>Longitude</label>
                        <input name="longitude" value={formData.longitude || ""} onChange={handleChange} />

                        <label>Description</label>
                        <textarea name="description" value={formData.description || ""} onChange={handleChange} />
                    </>
                );
            case "categories":
                return (
                    <>
                        <label>Name</label>
                        <input name="name" value={formData.name || ""} onChange={handleChange} />
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Edit {activeTab.slice(0, -1)}</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    {renderFields()}
                    <div className="modal-actions">
                        <button type="button" onClick={handleSubmit}>Save</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminPanel;
