import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiSend } from "../lib/api";

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const load = () =>
    apiGet(`/api/community/${id}`)
      .then((d) => setPost(d))
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, [id]);

  const addComment = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiSend(`/api/community/${id}/comments`, "POST", { body: comment });
      setComment("");
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="post-page">
      {error && <p className="error">{error}</p>}
      <h2>{post.title}</h2>
      <p>{post.body}</p>
      <small>{post.category} • {post.username}</small>
      <h3>Comments</h3>
      <div className="comments">
        {(post.comments || []).map((c) => (
          <div key={c.id} className="comment">
            <strong>{c.username}</strong>
            <p>{c.body}</p>
          </div>
        ))}
      </div>
      <form onSubmit={addComment} className="comment-form">
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." required />
        <button type="submit">Comment</button>
      </form>
    </div>
  );
}
