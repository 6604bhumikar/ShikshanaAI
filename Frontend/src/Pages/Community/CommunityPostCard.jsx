import { useState } from "react";
import "../../Pages/styles/community.css";
import avatarImg from "/avatar.png";
import {
  updateCommunityPost,
  deleteCommunityPost,
} from "@/lib/communityApi";

export default function CommunityPostCard({
  post,
  communityId,
  isTeacher,   // passed from CommunityFeed
  onRefresh,   // refetch after edit/delete
}) {
  if (!post) return null;

  const authorRole = post.author?.role;
  const authorName =
    authorRole === "teacher" ? "Instructor" : "Student";

  const avatar =
    post.author?.avatar && post.author.avatar !== ""
      ? post.author.avatar
      : avatarImg;

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(post.text || "");
  const [loading, setLoading] = useState(false);

  const time = post.createdAt
    ? new Date(post.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  /* =========================
     ✏️ EDIT POST
  ========================= */
  const handleUpdate = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);
      await updateCommunityPost(
        communityId,
        post._id,
        text
      );
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      alert("Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     🗑 DELETE POST
  ========================= */
  const handleDelete = async () => {
    const ok = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!ok) return;

    try {
      await deleteCommunityPost(
        communityId,
        post._id
      );
      onRefresh();
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  return (
    <div
      className={`message ${
        authorRole === "teacher" ? "teacher" : "student"
      }`}
    >
      {/* Avatar */}
      <img
        src={avatar}
        alt={authorName}
        className="chat-avatar"
      />

      <div className="chat-bubble">
        {/* Author */}
        <div className="chat-author">{authorName}</div>

        {/* =====================
            MESSAGE / EDIT MODE
        ====================== */}
        {isEditing ? (
          <>
            <textarea
              className="chat-edit-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="chat-actions">
              <button
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setText(post.text || "");
                }}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <div className="chat-text">{post.text}</div>
        )}

        {/* =====================
            ✏️ EDIT / DELETE
            (TEACHER ONLY)
        ====================== */}
        {isTeacher && !isEditing && (
          <div className="chat-actions">
            <button onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="danger"
            >
              Delete
            </button>
          </div>
        )}

        {/* Time */}
        <div className="message-time">{time}</div>
      </div>
    </div>
  );
}

