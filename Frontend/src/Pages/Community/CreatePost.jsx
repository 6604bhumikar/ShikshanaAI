import { useRef, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { createCommunityPost } from "@/lib/communityApi";
import "../styles/community.css";

export default function CreatePost({ communityId, onPostCreated }) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);

  /* =========================
     FILE PICK
  ========================= */
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  /* =========================
     SEND POST (FIXED)
  ========================= */
  const handleSubmit = async () => {
    if (!communityId) {
      alert("Community not selected");
      return;
    }

    if ((!content.trim() && files.length === 0) || loading) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("content", content.trim());

      files.forEach((file) => {
        formData.append("files", file);
      });

      // ✅ CRITICAL FIX: PASS communityId
      await createCommunityPost(communityId, formData);

      setContent("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      onPostCreated?.();
    } catch (err) {
      console.error("CREATE POST ERROR:", err);
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ENTER KEY SEND
  ========================= */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="create-post whatsapp-input">
      {/* 📎 Attachment */}
      <button
        type="button"
        className="attach-btn"
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip size={20} />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={handleFileChange}
      />

      {/* 💬 Text Input */}
      <textarea
        placeholder="Write a message…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
      />

      {/* 🟢 Send Button */}
      <button
        type="button"
        className={`send-btn ${
          content.trim() || files.length ? "active" : ""
        }`}
        onClick={handleSubmit}
        disabled={loading || (!content.trim() && files.length === 0)}
      >
        <Send size={18} />
      </button>
    </div>
  );
}



