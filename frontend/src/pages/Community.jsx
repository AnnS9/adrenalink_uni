import { useEffect, useState } from "react";

export default function CommunityGeneral() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/community/general")
      .then(res => res.json())
      .then(data => setPosts(data.posts))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading posts...</div>;

  return (
    <div>
      <h1>Community: All Posts</h1>
      {posts.length === 0 && <p>No posts yet.</p>}
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <h2>{post.title}</h2>
          <p>{post.body}</p>
          <p><em>By {post.username}</em></p>
        </div>
      ))}
    </div>
  );
}