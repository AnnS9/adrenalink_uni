import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Community.css";
import { apiGet, apiSend } from "../lib/api";

export default function Community({ isLoggedIn }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", body: "", category: "" });
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const d = await apiGet("/api/community");
      setPosts(Array.isArray(d.posts) ? d.posts : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    apiGet("/api/check-auth", { credentials: "include" })
      .then((d) => setIsAdmin(Boolean(d?.user?.role === "admin")))
      .catch(() => setIsAdmin(false));
    loadPosts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = newPost.title.trim();
    const body = newPost.body.trim();
    const category = newPost.category.trim();
    if (!title || !body || !category) {
      setError("All fields are required!");
      return;
    }
    try {
      const res = await apiSend("/api/community", "POST", { title, body, category });
      setPosts((prev) => [res.post, ...prev]);
      setShowForm(false);
      setNewPost({ title: "", body: "", category: "" });
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await apiSend(`/api/community/${postId}`, "DELETE");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      setError(e.message);
    }
  };

  if (!isLoggedIn) return <p className="community-guard">You must be logged in to view this forum.</p>;

  return (
    <div className="community-page">
      <header className="community-header">
        <h1>Community Forum</h1>
        <div className="community-actions">
          <button className="btn primary" onClick={() => setShowForm(true)}>Add New Post</button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <div className="posts-skeleton">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : posts.length === 0 ? (
        <p className="empty-state">No posts yet.</p>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <Link to={`/community/${post.id}`} key={post.id} className="post-card-link">
              <div className="post-card">
                <div className="post-card-top">
                  <span className="post-tag">#{post.category}</span>
                </div>
                <h2 className="post-title">{post.title}</h2>
                <p className="post-body">{post.body.length > 180 ? post.body.slice(0, 180) + "…" : post.body}</p>
                <div className="post-meta">
                  <span className="post-author">By {post.username}</span>
                </div>
                {isAdmin && (
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(post.id);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Post</h2>
              <button className="close" onClick={() => setShowForm(false)} aria-label="Close">×</button>
            </div>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit} className="post-form">
              <input
                type="text"
                name="category"
                placeholder="Category (tag)"
                value={newPost.category}
                onChange={handleInputChange}
                className="input"
              />
              <input
                type="text"
                name="title"
                placeholder="Post Title"
                value={newPost.title}
                onChange={handleInputChange}
                className="input"
              />
              <textarea
                name="body"
                placeholder="Post Content"
                value={newPost.body}
                onChange={handleInputChange}
                className="textarea"
                rows={5}
              />
              <div className="form-buttons">
                <button type="submit" className="sub-btn">Submit</button>
                <button type="button" className="btn" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
