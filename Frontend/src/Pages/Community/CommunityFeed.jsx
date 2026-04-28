import React, { useEffect, useRef, useState } from "react";
import { Users } from "lucide-react";
import { getCommunityPosts } from "@/lib/communityApi";
import CommunityPostCard from "./CommunityPostCard";
import CreatePost from "./CreatePost";
import "../styles/community.css";

export default function CommunityFeed({
  communityId,
  isTeacher,
  communityTitle = "Community",
}) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const role = isTeacher ? "teacher" : "student";
  const LIMIT = 10;

  /* =========================
     FETCH POSTS
  ========================= */
  const fetchPosts = async (pageNumber = 1, append = false) => {
    if (!communityId || loading) return;

    setLoading(true);
    try {
      const res = await getCommunityPosts(
        communityId,
        role,
        pageNumber,
        LIMIT
      );

      const newPosts = res.data?.posts ?? [];
      const total = res.data?.totalPosts ?? 0;

      setPosts((prev) =>
        append ? [...prev, ...newPosts] : newPosts
      );

      setHasMore(pageNumber * LIMIT < total);
      setPage(pageNumber);
    } catch (err) {
      console.error("FETCH POSTS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     RESET ON COMMUNITY CHANGE
  ========================= */
  useEffect(() => {
    if (!communityId) return;

    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, false);
    // eslint-disable-next-line
  }, [communityId]);

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  /* =========================
     INFINITE SCROLL
  ========================= */
  const handleScroll = () => {
    if (!containerRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } =
      containerRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      fetchPosts(page + 1, true);
    }
  };

  if (!communityId) {
    return (
      <div className="chat-empty">
        Select a community to start chatting
      </div>
    );
  }

  return (
    <div className="community-page">
      <div className="community-container">
        {/* 🔝 COMMUNITY HEADER */}
        <div className="community-header">
          <div className="community-header-inner">
            <div className="community-icon">
              <Users size={18} />
            </div>
            <div className="community-title">
              {communityTitle}
            </div>
          </div>
        </div>

        {/* 💬 MESSAGES */}
        <div
          className="messages"
          ref={containerRef}
          onScroll={handleScroll}
        >
          {!loading && posts.length === 0 && (
            <div className="chat-empty">No messages yet</div>
          )}

          {posts.map((post) => (
            <CommunityPostCard
              key={post._id}
              post={post}
              communityId={communityId}
              isTeacher={isTeacher}
              onRefresh={() => fetchPosts(1, false)}
            />
          ))}

          <div ref={bottomRef} />
        </div>

        {/* ⌨️ TEACHER INPUT (FIXED) */}
        {isTeacher && (
          <CreatePost
            communityId={communityId} // ✅ CRITICAL FIX
            onPostCreated={() => {
              setPage(1);
              fetchPosts(1, false);
            }}
          />
        )}
      </div>
    </div>
  );
}
