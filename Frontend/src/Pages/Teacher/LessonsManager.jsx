import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

/* ======================
     ICONS (Inline SVGs)
  ====================== */
const Icons = {
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
  ),
  Video: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
  ),
  FileText: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4m0 0l-4 4m4-4l4 4" /></svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  XCircle: () => (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
};

/* ======================
     UI COMPONENTS
  ====================== */

// Toast Notification
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-lg border-l-4 border-indigo-600 animate-bounce-in">
      {type === 'success' ? <Icons.CheckCircle /> : <Icons.XCircle />}
      <span className="text-sm font-medium text-gray-700">{message}</span>
    </div>
  );
};

// Confirmation Modal
const ConfirmModal = ({ isOpen, title, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all scale-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Lesson</h3>
        <p className="text-gray-500 mb-6">{title}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium shadow-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/* ======================
     MAIN COMPONENT
  ====================== */
export default function LessonsManager() {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  // Check multiple possible token keys as per original logic
  const accessToken =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("Token");

  // Data State
  const [unitTitle, setUnitTitle] = useState("");
  const [lessons, setLessons] = useState([]);

  // Form State
  const [title, setTitle] = useState("");
  const [type, setType] = useState("text"); // 'text' or 'video'
  const [content, setContent] = useState("");

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, index: null });

  /* ======================
     EFFECTS & LOAD
  ====================== */
  useEffect(() => {
    if (!courseId || !unitId) return;
    loadData();
  }, [courseId, unitId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load Units (to get Title)
      const unitsRes = await axios.get(
        `${API}/courses/${courseId}/units`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const foundUnit = unitsRes.data.units?.find((u) => u._id === unitId);

      if (!foundUnit) {
        setToast({ type: 'error', message: "Invalid unit selected." });
        setTimeout(() => navigate(`/teacher/courses/${courseId}/units`), 1500);
        return;
      }

      setUnitTitle(foundUnit.title);

      // 2. Load Lessons
      const lessonsRes = await axios.get(
        `${API}/courses/${courseId}/units/${unitId}/lessons`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setLessons(Array.isArray(lessonsRes.data.lessons) ? lessonsRes.data.lessons : []);
    } catch (err) {
      console.error("LOAD ERROR:", err);
      setToast({ type: 'error', message: "Failed to load lessons." });
      setTimeout(() => navigate(`/teacher/courses/${courseId}/units`), 1500);
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     ACTIONS
  ====================== */
  const addLesson = async () => {
    if (!title.trim() || !content.trim()) {
      setToast({ type: 'error', message: "Please fill in all fields." });
      return;
    }

    setSaving(true);
    try {
      await axios.post(
        `${API}/courses/${courseId}/units/${unitId}/lessons`,
        {
          title,
          type,
          contentUrl: type === "video" ? content : null,
          textContent: type === "text" ? content : null,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setTitle("");
      setContent("");
      setToast({ type: 'success', message: "Lesson added successfully." });
      await loadData();
    } catch (err) {
      console.error("ADD ERROR:", err);
      setToast({ type: 'error', message: "Failed to add lesson." });
    } finally {
      setSaving(false);
    }
  };

  const triggerDelete = (index) => {
    setConfirmModal({ isOpen: true, index });
  };

  const deleteLesson = async () => {
    const { index } = confirmModal;
    setConfirmModal({ isOpen: false, index: null });

    try {
      await axios.delete(
        `${API}/courses/${courseId}/units/${unitId}/lessons/${index}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setToast({ type: 'success', message: "Lesson deleted." });
      await loadData();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      setToast({ type: 'error', message: "Failed to delete lesson." });
    }
  };

  const openRecorder = (lessonId = "") => {
    const params = new URLSearchParams({
      courseId,
      unitId,
    });

    if (lessonId) {
      params.set("lessonId", lessonId);
    }

    navigate(`/teacher/recorder?${params.toString()}`);
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(`/teacher/courses/${courseId}/units`)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Icons.ArrowLeft />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-800 truncate">Lessons Manager</h1>
            <p className="text-sm text-slate-500 truncate">Unit: {unitTitle}</p>
          </div>
        </div>
      </header>

      {/* SCROLLABLE MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* ADD LESSON CARD */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Icons.Plus /> Create New Lesson
            </h2>

            <div className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Lesson Title</label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Introduction to React Hooks"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Type Selector */}
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Type</label>
                  <div className="relative">
                    <select
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 appearance-none bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="text">📄 Text</option>
                      <option value="video">🎬 Video</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                {/* Content Input */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">
                    {type === "video" ? "Video URL (YouTube/Vimeo)" : "Lesson Content"}
                  </label>
                  <textarea
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder={type === "video" ? "https://youtube.com/..." : "Type your lesson content here..."}
                    rows={1}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  onClick={() => openRecorder()}
                  type="button"
                  className="border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-5 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Icons.Upload />
                  Record / Upload Video
                </button>
                <button
                  onClick={addLesson}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>Add Lesson</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* LESSONS LIST */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-700">Existing Lessons</h2>
              <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{lessons.length} Total</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : lessons.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="text-slate-400 mb-2"><Icons.FileText /></div>
                <p className="text-slate-500 font-medium">No lessons added yet</p>
                <p className="text-sm text-slate-400">Use the form above to add content.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {lessons.map((lesson, index) => (
                  <div
                    key={`${lesson.title}-${index}`}
                    className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${lesson.type === 'video' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                        {lesson.type === 'video' ? <Icons.Video /> : <Icons.FileText />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 truncate">{lesson.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${lesson.type === 'video' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {lesson.type === 'video' ? 'Video' : 'Text'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openRecorder(lesson._id)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Record or upload video for this lesson"
                    >
                      <Icons.Upload />
                    </button>

                    <button
                      onClick={() => triggerDelete(index)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Delete Lesson"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* OVERLAYS */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Are you sure you want to delete this lesson? This action cannot be undone."
        onConfirm={deleteLesson}
        onCancel={() => setConfirmModal({ isOpen: false, index: null })}
      />

    </div>
  );
}
