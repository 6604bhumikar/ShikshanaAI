import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Send, MessageSquare, Hash, ArrowLeft } from "lucide-react";
import { teacherAPI } from "@/lib/api";

export default function TeacherAnnouncements() {
  const navigate = useNavigate();
  
  const token = localStorage.getItem("accessToken");

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    teacherAPI.get("/courses")
      .then((res) => setCourses(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCourses([]));
  }, [token]);

  useEffect(() => {
    if (courseId) loadAnnouncements();
    else setAnnouncements([]);
  }, [courseId]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await teacherAPI.get(`/courses/${courseId}/announcements`);
      setAnnouncements(Array.isArray(res.data?.announcements) ? res.data.announcements : []);
    } catch (error) {
      console.error("LOAD ERROR:", error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const sendAnnouncement = async () => {
    if (!courseId) return alert("Select a course first");
    if (!message.trim()) return alert("Message cannot be empty");

    try {
      await teacherAPI.post(`/courses/${courseId}/announcements`, { message: message.trim() });
      setMessage("");
      loadAnnouncements();
    } catch (error) {
      alert("Failed to post");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Announcements</h1>
              <p className="text-xs text-slate-500">Communicate with students</p>
            </div>
          </div>
          <select
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">Select Course</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>
      </header>

      {/* MAIN FEED */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          {loading && <div className="text-center text-slate-400">Loading...</div>}
          {!loading && announcements.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
              <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
              <p>No announcements yet.</p>
            </div>
          )}
          {announcements.map((a) => (
            <div key={a._id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                  T
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-900 text-sm">Teacher</h3>
                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      {new Date(a.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{a.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* INPUT AREA (STICKY BOTTOM) */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-lg z-20">
        <div className="max-w-4xl mx-auto flex gap-3">
          <div className="relative flex-1">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
               <Hash className="w-4 h-4" />
             </div>
            <input
              disabled={!courseId}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none disabled:opacity-50 transition-all"
              placeholder={courseId ? "Write an announcement..." : "Select a course to post..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendAnnouncement()}
            />
          </div>
          <button
            onClick={sendAnnouncement}
            disabled={!courseId || !message.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 rounded-xl flex items-center gap-2 font-medium transition-all shadow-md"
          >
            <Send className="w-4 h-4" /> Post
          </button>
        </div>
      </div>
    </div>
  );
}
