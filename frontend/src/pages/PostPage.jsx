import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../styles/Community.css";
import { apiGet, apiSend } from "../lib/api";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet(`/api/community/${id}`);
      setPost(data);
    } catch (e) {
      setError(e.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      await apiSend(`/api/community/${id}/comments`, "POST", { body: comment.trim() });
      const created = {
        body: comment.trim(),
        username: "You",
        created_at: new Date().toISOString(),
      };
      setPost((prev) => ({
        ...prev,
        comments: [created, ...(prev?.comments || [])],
      }));
      setComment("");
    } catch (e) {
      setError(e.message || "Failed to add comment");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="post-page">
        <div className="posts-skeleton">
          <div className="skeleton-card" />
        </div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="post-page">
        <Link to="/community" className="back-button">← Back</Link>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-page">
        <Link to="/community" className="back-button">← Back</Link>
        <p className="empty-state">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="post-page">
      <button className="back-button" onClick={() => navigate(-1)}>← Back</button>

      <div className="post-card">
        <div className="post-card-top">
          <span className="post-tag">#{post.category}</span>
        </div>
        <h1 className="post-title">{post.title}</h1>
        <p className="post-body">{post.body}</p>
        <div className="post-meta">
          <span className="post-author">By {post.username}</span>
        </div>
      </div>

      <div className="comments-section">
        {Array.isArray(post.comments) && post.comments.length > 0 ? (
          <ul className="comments-list">
            {post.comments.map((c, i) => (
              <li key={i} className="comment-card">
                <p className="comment-body">{c.body}</p>
                <p className="comment-author">
                  <strong>{c.username}</strong> ·{" "}
                  {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No comments yet.</p>
        )}

        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <button type="submit" className="sub-btn" disabled={sending}>
            {sending ? "Submitting..." : "Submit"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
