import React, { useState, useEffect, useCallback } from "react";
import "../styles/AdminPanel.css";
import AddDataModal from "../components/AddDataModal";
import EditDataModal from "../components/EditDataModal";
import { apiGet, apiSend } from "../lib/api";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");
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
      // Always use a leading slash so api.js builds a correct absolute URL
      const result = await apiGet(`/api/admin/${activeTab}`);
      // Some backends wrap in {items: [...]}. Cope with both.
      const rows = Array.isArray(result) ? result : result?.items || [];
      setData(rows);
    } catch (err) {
      setError(err.message || "Failed to load data");
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
    setCurrentItem(null);
    fetchData();
  };

  const openEditModal = (item) => {
    setCurrentItem(item);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (itemId) => {
    if (!itemId) {
      setError("Missing item ID");
      return;
    }
    if (window.confirm(`Delete this ${activeTab.slice(0, -1)}?`)) {
      try {
        await apiSend(`/api/admin/${activeTab}/${itemId}`, "DELETE");
        fetchData();
      } catch (err) {
        setError(err.message || "Failed to delete item");
      }
    }
  };

  const renderTableHeaders = () => {
    switch (activeTab) {
      case "users":
        return (
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        );
      case "places":
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
      case "categories":
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
      const colSpan = activeTab === "places" ? 10 : activeTab === "users" ? 5 : 3;
      return (
        <tr>
          <td colSpan={colSpan}>No data available.</td>
        </tr>
      );
    }

    return data.map((item) => {
      const key = item.id || item._id;
      const isEditing =
        currentItem && (currentItem.id || currentItem._id) === key;

      return (
        <tr key={key} className={isEditing ? "editing-row" : ""}>
          {activeTab === "users" && (
            <>
              <td>{key}</td>
              <td>{item.email}</td>
              <td>{item.username}</td>
              <td>{item.role}</td>
            </>
          )}

          {activeTab === "places" && (
            <>
              <td>{key}</td>
              <td>{item.name}</td>
              <td>{item.location}</td>
              <td>{item.rating}</td>
              <td>{item.image || "N/A"}</td>
              <td>{item.category_id || "N/A"}</td>
              <td>{item.latitude ?? "N/A"}</td>
              <td>{item.longitude ?? "N/A"}</td>
              <td>{item.description || "N/A"}</td>
            </>
          )}

          {activeTab === "categories" && (
            <>
              <td>{key}</td>
              <td>{item.name}</td>
            </>
          )}

          <td>
            <button className="edit-btn" onClick={() => openEditModal(item)}>
              Edit
            </button>
            <button className="delete-btn" onClick={() => handleDelete(key)}>
              Delete
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="admin-panel-container">
      <h1 className="admin-title">Admin Panel</h1>

      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab("users")}
          className={activeTab === "users" ? "active" : ""}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab("places")}
          className={activeTab === "places" ? "active" : ""}
        >
          Manage Places
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={activeTab === "categories" ? "active" : ""}
        >
          Manage Categories
        </button>
      </div>

      <div className="admin-actions">
        <button className="add-new-btn" onClick={() => setIsAddModalOpen(true)}>
          + Add New {activeTab.slice(0, -1)}
        </button>
      </div>

      <div className={`admin-content ${isEditModalOpen ? "editing-mode" : ""}`}>
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">Error: {error}</p>}
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

      {isEditModalOpen && currentItem && (
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

export default AdminPanel;
