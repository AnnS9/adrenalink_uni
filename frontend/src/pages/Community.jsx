import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Community.css";

export default function Community({ isLoggedIn }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", body: "", category: "" });
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
  fetch(`${BACKEND_URL}/api/check-auth`, { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      console.log("check-auth response:", data);
      setIsAdmin(data.user_role === "admin"); 
    })
    .catch(() => setIsAdmin(false));
}, [BACKEND_URL]);

 
  useEffect(() => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/community`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setPosts(data.posts || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [BACKEND_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = {
      title: newPost.title.trim(),
      body: newPost.body.trim(),
      category: newPost.category.trim()
    };
    if (!trimmed.title || !trimmed.body || !trimmed.category) {
      setError("All fields are required!");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/community`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(trimmed)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add post");
      setPosts(prev => [data.post, ...prev]);
      setShowForm(false);
      setNewPost({ title: "", body: "", category: "" });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/community/${postId}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isLoggedIn) return <p>You must be logged in to view this forum.</p>;
  if (loading) return <p>Loading posts...</p>;

  return (
    <div className="community-page">
      <h1>Community Forum</h1><br></br>

      <button onClick={() => setShowForm(true)}>Add New Post</button><br></br>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Post</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="category"
                placeholder="Category (tag)"
                value={newPost.category}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="title"
                placeholder="Post Title"
                value={newPost.title}
                onChange={handleInputChange}
              />
              <textarea
                name="body"
                placeholder="Post Content"
                value={newPost.body}
                onChange={handleInputChange}
              />
              <div className="form-buttons">
                <button type="submit" className="sub-btn">Submit</button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
           
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div className="posts-list">
  {posts.map(post => (
    <Link 
      to={`/community/${post.id}`} 
      key={post.id} 
      className="post-card-link"
    >
      <br></br><div className="post-card">
        <h2>{post.title}</h2>
        <p>{post.body.substring(0, 100)}...</p>
        <p><em>By {post.username}</em></p>
        <span className="post-tag">#{post.category}</span>
        

        {isAdmin && (
          <button
            className="delete-btn"
            onClick={(e) => { e.preventDefault(); handleDelete(post.id); }}
          >
            Delete
          </button>
          
        )}
      </div>
    </Link>
    
  ))}
</div>

      )}
    </div>
  );
}



