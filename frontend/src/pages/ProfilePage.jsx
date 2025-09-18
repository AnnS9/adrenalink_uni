import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/Profile.css';

const AVAILABLE_ACTIVITIES = [
  { name: 'Kitesurfing', image: '/images/kitesurfing.png' },
  { name: 'Mountain Biking', image: '/images/biking.png' },
  { name: 'Rock Climbing', image: '/images/climbing.png' },
  { name: 'Snowboarding', image: '/images/snowboarding.png' },
  { name: 'Zip Line', image: '/images/ziplining.png' },
  { name: 'Surfing', image: '/images/surfing.png' },
];

const ActivityIcon = ({ name }) => {
  const activity = AVAILABLE_ACTIVITIES.find(a => a.name === name);
  return (
    <div className="activity-display-item">
      <div className="activity-display-icon">
        {activity && <img src={activity.image} alt={activity.name} />}
      </div>
      <span className="activity-display-name">{name}</span>
    </div>
  );
};

export default function ProfilePage() {
  const [adrenaid, setProfile] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/adrenaid', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          navigate('/');
        } else {
          setProfile(data);
        }
      });
  }, [navigate]);

  const handleDelete = () => {
    fetch('/api/adrenaid', { method: 'DELETE', credentials: 'include' })
      .then(() => navigate('/'));
  };

  if (!adrenaid) return <div className="loading">Loading profile...</div>;

  const userActivities = adrenaid.activities
    ? adrenaid.activities.split(',').map(a => a.trim()).filter(Boolean)
    : [];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img
          src={adrenaid.profile_picture || '/images/default_avatar.jpeg'}
          alt="Avatar"
          className="avatar"
        />
        <h2>Hello <br /> {adrenaid.full_name || adrenaid.username}</h2>
        {adrenaid.location && (
          <div className="location-info">
            <svg className="location-pin-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.69 18.23a1.55 1.55 0 002.62 0C15.52 14.39 18 11.23 18 8.5 18 4.91 14.42 2 10.5 2S3 4.91 3 8.5c0 2.73 2.48 5.89 5.69 9.73zM10.5 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
            </svg>
            <span>{adrenaid.location}</span>
          </div>
        )}
      </div>

      {userActivities.length > 0 && (
        <div className="profile-activities">
          <div className="profile-activities-grid">
            {userActivities.map(activity => (
              <ActivityIcon key={activity} name={activity} />
            ))}
          </div>
        </div>
      )}

      <div className="profile-actions">
        <button onClick={() => navigate('/adrenaid/edit')}>Edit Profile</button>
        <button onClick={() => navigate('/tracks')}>Tracks</button>
        <button className="danger" onClick={() => setShowConfirm(true)}>Delete Account</button>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Delete Account"
          message="Are you sure you want to permanently delete your account? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
