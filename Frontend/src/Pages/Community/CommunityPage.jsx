import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { studentAPI, teacherAPI } from "@/lib/api";
import CommunityFeed from "./CommunityFeed";
import "@/pages/styles/community.css";

export default function CommunityPage({ isTeacher }) {
  const { communityId } = useParams();

  const [communities, setCommunities] = useState([]);
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommunities();
    // eslint-disable-next-line
  }, []);

  /* =========================
     FETCH COMMUNITIES
  ========================= */
  const fetchCommunities = async () => {
    try {
      setLoading(true);

      const res = isTeacher
        ? await teacherAPI.get("/communities")
        : await studentAPI.get("/communities");

      const list = Array.isArray(res.data) ? res.data : [];

      let enriched = list;

      // 🔐 student join status
      if (!isTeacher) {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const studentId =
          storedUser?.userId || storedUser?._id || null;

        enriched = list.map((c) => ({
          ...c,
          isJoined: c.members?.some(
            (id) => id.toString() === studentId?.toString()
          ),
        }));
      }

      setCommunities(enriched);

      // 🎯 set active
      if (communityId) {
        const matched = enriched.find((c) => c._id === communityId);
        if (matched) {
          setActiveCommunity(matched);
          return;
        }
      }

      setActiveCommunity(enriched[0] || null);
    } catch (err) {
      console.error("FETCH COMMUNITIES ERROR:", err);
      setCommunities([]);
      setActiveCommunity(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ✅ JOIN COMMUNITY (FIXED – ADD ONLY)
  ========================= */
  const handleJoinCommunity = async (communityId) => {
    try {
      await studentAPI.post(`/communities/${communityId}/join`);

      await fetchCommunities(); // refresh join state
    } catch (err) {
      console.error("JOIN COMMUNITY ERROR:", err);
      alert("Unable to join community");
    }
  };

  return (
    <div className="community-layout">
     
      {/* =====================
          SIDEBAR (ONLY LIST)
      ====================== */}
      {/* <aside className="community-sidebar">
        <h3 className="sidebar-title">Communities</h3>

        {loading && <p className="sidebar-loading">Loading...</p>}

        {!loading && communities.length === 0 && (
          <p className="sidebar-empty">No communities available</p>
        )}

        {!loading &&
          communities.map((c) => (
            <div
              key={c._id}
              className={`community-item ${
                activeCommunity?._id === c._id ? "active" : ""
              }`}
              onClick={() => setActiveCommunity(c)}
            >
              {!isTeacher && (
                <span
                  className={`community-status ${
                    c.isJoined ? "joined" : "not-joined"
                  }`}
                >
                  {c.isJoined ? "Joined" : "Join first"}
                </span>
              )}
              {!isTeacher && !c.isJoined && (
                <button
                  className="join-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinCommunity(c._id);
                  }}
                >
                  Join
                </button>
              )}
            </div>
          ))}
      cc */}

      {/* =====================
          CHAT AREA
      ====================== */}
    

      <section className="community-chat">
        {!activeCommunity ? (
          <div className="chat-empty">
            Select a community to start chatting
          </div>
        ) : !isTeacher && !activeCommunity.isJoined ? (
          <div className="chat-empty">
            You must join this community to view messages
          </div>
        ) : (
          <CommunityFeed
            communityId={activeCommunity._id}
            isTeacher={isTeacher}
            communityTitle={activeCommunity.title}
          />
        )}
      </section>
    </div>
  );
}

