import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/Profile.css";

const AVAILABLE_ACTIVITIES = [
  { name: "Kitesurfing", image: "/images/kitesurfing.png" },
  { name: "Mountain Biking", image: "/images/biking.png" },
  { name: "Rock Climbing", image: "/images/climbing.png" },
  { name: "Snowboarding", image: "/images/snowboarding.png" },
  { name: "Zip Line", image: "/images/ziplining.png" },
  { name: "Surfing", image: "/images/surfing.png" },
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

export default function PublicProfile() {
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch user profile");
        const data = await res.json();
        setUserProfile(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUserProfile();
  }, [userId]);

  if (loading) return <div className="loading">Loading user profile...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!userProfile) return <div className="error">User not found.</div>;

  const userActivities = Array.isArray(userProfile.activities)
    ? userProfile.activities
    : userProfile.activities
    ? userProfile.activities.split(",").map(a => a.trim()).filter(Boolean)
    : [];

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img
          src={userProfile.profile_picture || "/images/default_avatar.jpeg"}
          alt="Avatar"
          className="avatar"
        />
        <h2>{userProfile.full_name || userProfile.username}</h2>
        {userProfile.location && (
          <div className="location-info">
            <svg
              className="location-pin-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.69 18.23a1.55 1.55 0 002.62 0C15.52 14.39 18 11.23 18 8.5 18 4.91 14.42 2 10.5 2S3 4.91 3 8.5c0 2.73 2.48 5.89 5.69 9.73zM10.5 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                clipRule="evenodd"
              />
            </svg>
            <span>{userProfile.location}</span>
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
    </div>
  );
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    