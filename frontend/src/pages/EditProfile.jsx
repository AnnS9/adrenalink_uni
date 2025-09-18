import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css'; 

const ActivityIcon = ({ name, image }) => (
  <div className="activity-icon">
    <img src={image} alt={name} className="activity-image" />
    <span className="activity-name">{name}</span>
  </div>
);

const AVAILABLE_ACTIVITIES = [
  { name: 'Kitesurfing', image: '/images/kitesurfing.png' },
  { name: 'Mountain Biking', image: '/images/biking.png' },
  { name: 'Rock Climbing', image: '/images/climbing.png' },
  { name: 'Snowboarding', image: '/images/snowboarding.png' },
  { name: 'Zip Line', image: '/images/ziplining.png' },
  { name: 'Surfing', image: '/images/surfing.png' },
];

const AVAILABLE_AVATARS = [
  '/images/avatar1.png',
  '/images/avatar2.png',
  '/images/avatar3.png',
];

export default function EditProfile() {
  const [form, setForm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/adrenaid', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          navigate('/');
        } else {
          setForm({
            full_name: data.full_name || '',
            location: data.location || '',
            profile_picture: data.profile_picture || '',
            activities: data.activities
              ? (Array.isArray(data.activities) ? data.activities : data.activities.split(',').map(a => a.trim()))
              : [],
            current_password: '',
            new_password: ''
          });
        }
      });
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleActivityToggle = (activity) => {
    const currentActivities = form.activities || [];
    const newActivities = currentActivities.includes(activity)
      ? currentActivities.filter(a => a !== activity)
      : [...currentActivities, activity];
    setForm({ ...form, activities: newActivities });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { ...form };

    // Don't send password fields if new password is empty
    if (!form.new_password) {
      delete payload.current_password;
      delete payload.new_password;
    }

    fetch('/api/adrenaid', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(() => navigate('/adrenaid'));
  };

  if (!form) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
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
      
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="profile-picture-wrapper">
          <img
            src={form.profile_picture || '/images/default_avatar.jpeg'}
            alt="Profile"
            className="profile-picture"
          />
        </div>

        {/* Password fields */}
        <div className="form-group">
          <label htmlFor="current_password" className="form-label">Current Password</label>
          <input
            id="current_password"
            name="current_password"
            type="password"
            value={form.current_password}
            onChange={handleChange}
            placeholder="Enter your current password"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="new_password" className="form-label">New Password</label>
          <input
            id="new_password"
            name="new_password"
            type="password"
            value={form.new_password}
            onChange={handleChange}
            placeholder="Enter a new password (leave blank to keep existing)"
            className="form-input"
          />
        </div>

        {/* Activities */}
        <div className="form-group">
          <label className="form-label">Your Activities</label>
          <div className="activity-grid">
          {AVAILABLE_ACTIVITIES.map(activity => (
            <button
              key={activity.name}
              type="button"
              onClick={() => handleActivityToggle(activity.name)}
              className={`activity-item ${form.activities.includes(activity.name) ? 'selected' : ''}`}
            >
              <ActivityIcon name={activity.name} image={activity.image} />
            </button>
          ))}
        </div>
        </div>

        {/* Profile Details */}
        <div className="form-group">
          <label htmlFor="full_name" className="form-label">Name</label>
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
          <label htmlFor="location" className="form-label">Location</label>
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
                className={`avatar-item ${form.profile_picture === avatar ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, profile_picture: avatar })}
              >
                <img src={avatar} alt={`Avatar ${idx + 1}`} className="avatar-image" />
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="button-group">
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate('/adrenaid')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
