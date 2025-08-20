import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/CommunityCat.css";

export default function CommunityCat() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", body: "", username: "" });
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // change based on auth logic

  const backendUrl = "http://localhost:5000";

  // Check if user is admin (replace with real auth check)
  useEffect(() => {
    fetch(`${backendUrl}/api/check-auth`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  // Fetch posts for the category
  useEffect(() => {
    setLoading(true);
    fetch(`${backendUrl}/api/community/${category}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      })
      .then(data => setPosts(data.posts))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.body || !newPost.username) {
      setError("All fields are required!");
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/community/${category}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newPost),
      });
      if (!res.ok) throw new Error("Failed to add post");
      const data = await res.json();
      setPosts(prev => [data.post, ...prev]);
      setShowForm(false);
      setNewPost({ title: "", body: "", username: "" });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${backendUrl}/api/community/${category}/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading posts...</div>;

  return (
    <div className="community-cat-page">
      <h1>Community: {category.replace(/-/g, " ")}</h1>

      <div className="community-buttons">
        <button onClick={() => setShowForm(true)}>Add New Post</button>
        <button onClick={() => navigate("/communitygeneral")}>Go to General Community</button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Post</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="username"
                placeholder="Your Name"
                value={newPost.username}
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
                <button type="submit">Submit</button>
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
            <div key={post.id} className="post-card">
              <h2>{post.title}</h2>
              <p>{post.body}</p>
              <p><em>By {post.username}</em></p>
              {isAdmin && (
                <button className="delete-btn" onClick={() => handleDelete(post.id)}>Delete</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
