import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import ConfirmModal from "../components/ConfirmModal";
import { apiGet, apiSend } from "../lib/api";

const ActivityIcon = ({ name, image }) => (
  <div className="activity-icon">
    <img src={image} alt={name} className="activity-image" />
    <span className="activity-name">{name}</span>
  </div>
);

const AVAILABLE_ACTIVITIES = [
  { name: "Kitesurfing", image: "/images/kitesurfing.png" },
  { name: "Mountain Biking", image: "/images/biking.png" },
  { name: "Rock Climbing", image: "/images/climbing.png" },
  { name: "Snowboarding", image: "/images/snowboarding.png" },
  { name: "Zip Line", image: "/images/ziplining.png" },
  { name: "Surfing", image: "/images/surfing.png" },
];

const AVAILABLE_AVATARS = [
  "/images/avatar1.png",
  "/images/avatar2.png",
  "/images/avatar3.png",
  "/images/avatar4.png",
  "/images/avatar5.png",
  "/images/default_avatar.png",
];

export default function EditProfile() {
  const [form, setForm] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    setError("");
    apiGet("/api/profile/me")
      .then((data) => {
        if (!alive) return;
        const u = data?.user || data || {};
        const activities =
          Array.isArray(u.activities)
            ? u.activities
            : typeof u.activities === "string" && u.activities.length
            ? u.activities.split(",").map((a) => a.trim()).filter(Boolean)
            : [];
        setForm({
          full_name: u.full_name || "",
          location: u.location || "",
          profile_picture: u.profile_picture || "",
          activities,
          current_password: "",
          new_password: "",
        });
      })
      .catch((e) => {
        const msg = e?.message || "";
        if (/unauthorized/i.test(msg) || /401/.test(msg)) navigate("/", { replace: true });
        else setError(msg || "Failed to load profile");
      });
    return () => {
      alive = false;
    };
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleActivityToggle = (activity) => {
    const current = form.activities || [];
    const next = current.includes(activity)
      ? current.filter((a) => a !== activity)
      : [...current, activity];
    setForm((prev) => ({ ...prev, activities: next }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    const payload = {
      full_name: form.full_name.trim(),
      location: form.location.trim(),
      profile_picture: form.profile_picture.trim(),
      activities: (form.activities || []).join(", "),
    };
    if (form.new_password) {
      payload.current_password = form.current_password || "";
      payload.new_password = form.new_password || "";
    }
    try {
      await apiSend("/api/profile/me", "PUT", payload);
      navigate("/adrenaid", { replace: true });
    } catch (e2) {
      setError(e2.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    try {
      await apiSend("/api/profile/me", "DELETE");
      navigate("/", { replace: true });
    } catch (e2) {
      setError(e2.message || "Delete failed");
      setShowConfirm(false);
    }
  };

  if (!form) return <div className="loading-screen">Loading...</div>;

  return (
    <>
      <div className="edit-profile-container">
        <header className="edit-profile-header">
          <button onClick={() => navigate(-1)} className="back-button">
            Back
          </button>
          <h1 className="header-title">
            ADRENA<span className="header-title-brand">ID</span>
          </h1>
          <div className="header-spacer"></div>
        </header>

        {error && <p className="error-text">Error: {error}</p>}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="profile-picture-wrapper">
            <img
              src={form.profile_picture || "/images/default_avatar.jpeg"}
              alt="Profile"
              className="profile-picture"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Your Activities</label>
            <div className="activity-grid">
              {AVAILABLE_ACTIVITIES.map((activity) => (
                <button
                  key={activity.name}
                  type="button"
                  onClick={() => handleActivityToggle(activity.name)}
                  className={`activity-item ${
                    form.activities.includes(activity.name) ? "selected" : ""
                  }`}
                  aria-pressed={form.activities.includes(activity.name)}
                >
                  <ActivityIcon name={activity.name} image={activity.image} />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="full_name" className="form-label">
              Name
            </label>
            <input
              id="full_name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="What other users will see on your profile"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g., Scotland"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Choose a Profile Picture</label>
            <div className="avatar-grid">
              {AVAILABLE_AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`avatar-item ${
                    form.profile_picture === avatar ? "selected" : ""
                  }`}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, profile_picture: avatar }))
                  }
                  aria-pressed={form.profile_picture === avatar}
                >
                  <img src={avatar} alt={`Avatar ${idx + 1}`} className="avatar-image" />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="current_password" className="form-label">
              Current Password
            </label>
            <input
              id="current_password"
              name="current_password"
              type="password"
              value={form.current_password}
              onChange={handleChange}
              placeholder="Enter your current password"
              className="form-input"
              autoComplete="current-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="new_password" className="form-label">
              New Password
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              value={form.new_password}
              onChange={handleChange}
              placeholder="Enter a new password"
              className="form-input"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <button
              type="button"
              className="btn btn-secondary danger"
              onClick={() => setShowConfirm(true)}
              aria-label="Delete account"
              title="Delete account"
            >
              <FontAwesomeIcon icon={faTrashCan} className="icon-space" />
              Delete Account
            </button>
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/adrenaid")}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
        <br />
        <br />
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Delete Account"
          message="Are you sure you want to permanently delete your account? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
