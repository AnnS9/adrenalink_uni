import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Community.css";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  // Check if user is admin
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/check-auth`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setIsAdmin(data.user_role === "admin"))
      .catch(() => setIsAdmin(false));
  }, [BACKEND_URL]);

  // Load post data
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/community/${id}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setPost(data))
      .catch(err => setError(err.message));
  }, [id, BACKEND_URL]);

  // Add comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/community/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: comment.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add comment");

      setPost(prev => ({
        ...prev,
        comments: [{ id: data.comment.id, body: comment.trim(), username: "You", created_at: new Date().toISOString() }, ...(prev.comments || [])]
      }));
      setComment("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/community/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");
      navigate("/community");
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/community/${id}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete comment");

      setPost(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c.id !== commentId)
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!post) return <p>Loading...</p>;

  return (
    <div className="post-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="post-card">
        <h1 className="post-title">{post.title}</h1>
        <span className="post-tag">{post.category}</span>
        <p className="post-body">{post.body}</p>
        <p className="post-author"><em>By {post.username}</em></p>

        {isAdmin && (
          <button className="delete-btn" onClick={handleDeletePost}>
            Delete Post
          </button>
        )}
      </div>

      <div className="comments-section">
        {post.comments && post.comments.length === 0 && <p>No comments yet.</p>}
        {post.comments && post.comments.length > 0 && (
          <ul className="comments-list">
            {post.comments.slice().reverse().map((c) => (
              <li key={c.id} className="comment-card">
                <p className="comment-body">{c.body}</p>
                <p className="comment-author">
                  <strong>{c.username}</strong> - {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                </p>
                {isAdmin && (
                  <button className="delete-btn" onClick={() => handleDeleteComment(c.id)}>
                    Delete Comment
                  </button>
                )}
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
          <button type="submit" className="sub-btn">Submit</button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
