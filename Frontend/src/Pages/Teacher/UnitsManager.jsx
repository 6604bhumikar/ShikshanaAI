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
  BookOpen: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
  ),
  Quiz: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  XCircle: () => (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
};

/* ======================
     COMPONENTS
  ====================== */

// Simple Toast Notification
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-lg border-l-4 border-indigo-600 animate-fade-in-down">
      {type === 'success' ? <Icons.CheckCircle /> : <Icons.XCircle />}
      <span className="text-sm font-medium text-gray-700">{message}</span>
    </div>
  );
};

// Confirmation Modal
const ConfirmModal = ({ isOpen, title, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all scale-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Unit</h3>
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
export default function UnitsManager() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const accessToken = localStorage.getItem("accessToken");
  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";

  // State
  const [units, setUnits] = useState([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [unitTitle, setUnitTitle] = useState("");
  const [saving, setSaving] = useState(false);
  
  // UI State
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, unitId: null });

  // Auth + Load
  useEffect(() => {
    if (!accessToken) {
      setToast({ type: 'error', message: "Session expired. Please login again." });
      setTimeout(() => navigate("/login"), 1500);
      return;
    }
    loadUnits();
  }, [courseId]);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/courses/${courseId}/units`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const fetchedUnits = Array.isArray(res.data.units)
        ? res.data.units.filter((u) => u && u._id)
        : [];
      setCourseTitle(res.data.courseTitle || "");
      setUnits(fetchedUnits);
    } catch (err) {
      console.error("LOAD ERROR:", err);
      setToast({ type: 'error', message: "Failed to load units." });
      // navigate("/teacher/my-courses"); // Optional: decide if you want to auto-redirect on error
    } finally {
      setLoading(false);
    }
  };

  const addUnit = async () => {
    if (!unitTitle.trim()) {
      setToast({ type: 'error', message: "Unit title is required" });
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        `${API}/courses/${courseId}/units`,
        { title: unitTitle },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setUnitTitle("");
      setToast({ type: 'success', message: "Unit added successfully!" });
      await loadUnits();
    } catch (err) {
      console.error("ADD ERROR:", err);
      setToast({ type: 'error', message: "Failed to add unit." });
    } finally {
      setSaving(false);
    }
  };

  const triggerDelete = (unitId) => {
    setConfirmModal({ isOpen: true, unitId });
  };

  const deleteUnit = async () => {
    const { unitId } = confirmModal;
    setConfirmModal({ isOpen: false, unitId: null });
    
    try {
      await axios.delete(
        `${API}/courses/${courseId}/units/${unitId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setToast({ type: 'success', message: "Unit deleted." });
      await loadUnits();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      setToast({ type: 'error', message: "Failed to delete unit." });
    }
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* HEADER / ACTIONS */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Title & Breadcrumb */}
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={() => navigate("/teacher/my-courses")}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
              title="Back to Courses"
            >
              <Icons.ArrowLeft />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-800 truncate">Units Manager</h1>
              <p className="text-sm text-slate-500 truncate">{courseTitle || "Loading course..."}</p>
            </div>
          </div>

          {/* Right: Add Unit Input */}
          <div className="flex items-center gap-2 w-full md:w-auto bg-slate-50 p-1.5 rounded-lg border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
            <input
              className="bg-transparent border-none outline-none text-sm px-3 py-1 w-full md:w-64 text-slate-700 placeholder-slate-400"
              placeholder="New Unit Title..."
              value={unitTitle}
              onChange={(e) => setUnitTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addUnit()}
            />
            <button
              onClick={addUnit}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium px-2"><Icons.Plus /> Add</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT (SCROLLABLE) */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading course structure...</p>
            </div>
          ) : units.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="p-4 bg-white rounded-full shadow-sm mb-3 text-slate-300">
                <Icons.BookOpen />
              </div>
              <h3 className="text-slate-900 font-medium">No units yet</h3>
              <p className="text-slate-500 text-sm mt-1">Create your first unit using the input above.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {units.map((unit) => (
                <div
                  key={unit._id}
                  className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  
                  {/* Unit Info */}
                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <Icons.BookOpen />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 truncate text-lg">{unit.title}</h3>
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                           {unit.lessons?.length || 0} Lessons
                        </span>
                        {unit.quizCount > 0 ? (
                          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <Icons.Quiz /> {unit.quizCount} Questions
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No Quiz</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate(`/teacher/courses/${courseId}/units/${unit._id}/lessons`)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors"
                    >
                      <Icons.BookOpen /> Lessons
                    </button>
                    <button
                      onClick={() => navigate(`/teacher/courses/${courseId}/units/${unit._id}/quiz`)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition-colors"
                    >
                      <Icons.Quiz /> Quiz
                    </button>
                    <button
                      onClick={() => triggerDelete(unit._id)}
                      className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors ml-2"
                      title="Delete Unit"
                    >
                      <Icons.Trash />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* FOOTER / STATUS BAR (Optional padding) */}
      <div className="bg-white border-t border-slate-200 p-2 text-center text-xs text-slate-400 shrink-0">
        Course Manager v1.0
      </div>

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
        title="Are you sure you want to delete this unit? This action cannot be undone."
        onConfirm={deleteUnit}
        onCancel={() => setConfirmModal({ isOpen: false, unitId: null })}
      />
    </div>
  );
}
