import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Community.css";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate(); // <-- Add navigate
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/community/${id}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setPost(data))
      .catch(err => setError(err.message));
  }, [id, BACKEND_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/community/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: comment })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add comment");

      setPost(prev => ({
        ...prev,
        comments: [{ body: comment, username: "You", created_at: new Date().toISOString() }, ...prev.comments]
      }));
      setComment("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!post) return <p>Loading...</p>;

  return (
    <div className="post-page">
      <br></br>
      <br></br>
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="post-card">
        <h1 className="post-title">{post.title}</h1>
        <span className="post-tag">{post.category}</span>
        <p className="post-body">{post.body}</p>
        <p className="post-author"><em>By {post.username}</em></p>
      </div>

      <div className="comments-section">
        {post.comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <ul className="comments-list">
            {post.comments.slice().reverse().map((c, i) => (
              <li key={i} className="comment-card">
                <p className="comment-body">{c.body}</p>
                <p className="comment-author"><strong>{c.username}</strong> - {new Date(c.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button type="submit">Submit</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
