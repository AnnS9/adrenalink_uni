import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiSend } from "../lib/api";

export default function Community({ isLoggedIn }) {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const loadPosts = () =>
    apiGet("/api/community")
      .then((d) => setPosts(Array.isArray(d.posts) ? d.posts : []))
      .catch((e) => setError(e.message));

  useEffect(() => {
    loadPosts();
  }, []);

  const submitPost = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiSend("/api/community", "POST", { category, title, body });
      setCategory("");
      setTitle("");
      setBody("");
      await loadPosts();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="community-page">
      <h2>Community</h2>
      {error && <p className="error">{error}</p>}
      {isLoggedIn && (
        <form onSubmit={submitPost} className="post-form">
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" required />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your post..." required />
          <button type="submit">Publish</button>
        </form>
      )}
      <div className="posts">
        {posts.map((p) => (
          <Link key={p.id} to={`/community/${p.id}`} className="post">
            <h3>{p.title}</h3>
            <p>{p.body}</p>
            <small>{p.category} • {p.username}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
