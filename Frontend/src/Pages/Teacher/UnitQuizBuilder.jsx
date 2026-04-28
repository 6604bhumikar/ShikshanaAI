import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

/* ======================
     ICONS
  ====================== */
const Icons = {
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
  ),
  Save: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  XCircle: () => (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  List: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
  )
};

/* ======================
     UI COMPONENTS
  ====================== */
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

const ConfirmModal = ({ isOpen, title, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Question</h3>
        <p className="text-gray-500 mb-6">{title}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium shadow-md">Delete</button>
        </div>
      </div>
    </div>
  );
};

/* ======================
     MAIN COMPONENT
  ====================== */
export default function UnitQuizBuilder() {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const accessToken = localStorage.getItem("accessToken");

  /* =========================
     HELPERS (REQUIRED)
  ========================== */
  const normalizeQuestion = (q) => ({
    ...q,
    options:
      q.type === "mcq"
        ? (q.options || []).map((opt) =>
            typeof opt === "string" ? opt : opt?.text || ""
          )
        : q.options,
  });

  const denormalizeQuestion = (q) => ({
    ...q,
    options:
      q.type === "mcq"
        ? q.options.map((opt) => ({ text: opt }))
        : q.options,
  });

  /* =========================
     STATE
  ========================== */
  const emptyQuestion = {
    question: "",
    type: "mcq",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    pairs: [
      { left: "", right: "" },
      { left: "", right: "" },
    ],
  };

  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState(emptyQuestion);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // UI State
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, index: null });

  /* =========================
     LOAD QUIZ
  ========================== */
  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      const res = await axios.get(`${API}/courses/${courseId}/units/${unitId}/quiz`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const fetched = res.data?.quiz?.questions || [];
      setQuestions(fetched.map(normalizeQuestion));
    } catch (err) {
      console.error("LOAD QUIZ ERROR:", err.response?.data || err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ACTIONS
  ========================== */
  const addOrUpdateQuestion = () => {
    if (!newQ.question.trim()) {
      setToast({ type: 'error', message: "Enter question text" });
      return;
    }

    if (!newQ.marks || newQ.marks < 1) {
      setToast({ type: 'error', message: "Marks must be at least 1" });
      return;
    }

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = newQ;
      setQuestions(updated);
      setToast({ type: 'success', message: "Question updated" });
      setEditingIndex(null);
    } else {
      setQuestions([...questions, newQ]);
      setToast({ type: 'success', message: "Question added" });
    }

    setNewQ(emptyQuestion);
  };

  const editQuestion = (index) => {
    setNewQ(normalizeQuestion(questions[index]));
    setEditingIndex(index);
    // Scroll to top on mobile to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerDelete = (index) => {
    setConfirmModal({ isOpen: true, index });
  };

  const deleteQuestion = async () => {
    const { index } = confirmModal;
    setConfirmModal({ isOpen: false, index: null });
    setQuestions(questions.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setNewQ(emptyQuestion);
    }
  };

  const saveQuiz = async () => {
    setSaving(true);
    try {
      const payload = questions.map(denormalizeQuestion);
      await axios.post(
        `${API}/courses/${courseId}/units/${unitId}/quiz`,
        { questions: payload },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setToast({ type: 'success', message: "Quiz saved successfully!" });
      setTimeout(() => navigate(`/teacher/courses/${courseId}/units`), 1500);
    } catch (err) {
      console.error("SAVE QUIZ ERROR:", err.response?.data || err);
      setToast({ type: 'error', message: "Failed to save quiz" });
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     RENDER
  ========================== */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p>Loading Quiz Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 shrink-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/teacher/courses/${courseId}/units`)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <Icons.ArrowLeft />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Unit Quiz Builder</h1>
              <p className="text-xs text-slate-500">Manage questions and answers</p>
            </div>
          </div>
          
          <button
            onClick={saveQuiz}
            disabled={saving || questions.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all"
          >
            {saving ? "Saving..." : <><Icons.Save /> Save Quiz</>}
          </button>
        </div>
      </header>

      {/* SPLIT LAYOUT */}
      <main className="flex-1 flex overflow-hidden">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 h-full">
          
          {/* LEFT COLUMN: EDITOR (STICKY ON DESKTOP) */}
          <div className="lg:col-span-4 bg-white border-r border-slate-200 p-6 overflow-y-auto">
            <div className="sticky top-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  {editingIndex !== null ? <span className="text-yellow-600"><Icons.Edit /> Edit</span> : <span className="text-indigo-600"><Icons.Plus /> Add</span>} Question
                </h2>
                {editingIndex !== null && (
                  <button 
                    onClick={() => { setEditingIndex(null); setNewQ(emptyQuestion); }}
                    className="text-xs text-slate-500 underline hover:text-red-500"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Question Text</label>
                  <textarea
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-none"
                    rows={3}
                    placeholder="Enter the question here..."
                    value={newQ.question}
                    onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Type</label>
                    <select
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                      value={newQ.type}
                      onChange={(e) => setNewQ({ ...newQ, type: e.target.value })}
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="text">Short Text</option>
                      <option value="fill">Fill in Blank</option>
                      <option value="code">Code Snippet</option>
                      <option value="conditional">Yes/No</option>
                    </select>
                  </div>

                  {/* Marks */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Marks</label>
                    <input
                      type="number"
                      min={1}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                      value={newQ.marks}
                      onChange={(e) => setNewQ({ ...newQ, marks: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* DYNAMIC ANSWER INPUT */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                    {newQ.type === "mcq" ? "Options" : "Correct Answer"}
                  </label>
                  
                  {/* MCQ Options */}
                  {newQ.type === "mcq" && (
                    <div className="space-y-2">
                      {newQ.options.map((opt, i) => (
                        <input
                          key={i}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const options = [...newQ.options];
                            options[i] = e.target.value;
                            setNewQ({ ...newQ, options });
                          }}
                        />
                      ))}
                      <div className="pt-2">
                        <label className="text-xs text-slate-400 mb-1 block">Select Correct Option Text</label>
                        <input
                          className="w-full border border-indigo-200 bg-indigo-50 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                          placeholder="Paste the exact correct answer here"
                          value={newQ.correctAnswer}
                          onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Conditional Select */}
                  {newQ.type === "conditional" && (
                    <select
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none bg-white"
                      value={newQ.correctAnswer}
                      onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                    >
                      <option value="">Select Answer</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Depends">Depends</option>
                    </select>
                  )}

                  {/* Text / Fill / Code Input */}
                  {["text", "fill", "code"].includes(newQ.type) && (
                    <input
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-mono"
                      placeholder={newQ.type === 'code' ? "// Code answer..." : "Type answer..."}
                      value={newQ.correctAnswer}
                      onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })}
                    />
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={addOrUpdateQuestion}
                  className={`w-full py-3 rounded-lg font-bold text-white shadow-md transition-all transform active:scale-95 ${
                    editingIndex !== null ? "bg-yellow-500 hover:bg-yellow-600" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {editingIndex !== null ? "Update Question" : "Add to Quiz"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: QUESTION LIST */}
          <div className="lg:col-span-8 bg-slate-50 p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Icons.List /> Questions List
                </h2>
                <span className="text-xs font-bold bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-600 shadow-sm">
                  {questions.length} Total
                </span>
              </div>

              {questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                  <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-2"><Icons.List /></div>
                  <p className="text-slate-500 font-medium">No questions yet</p>
                  <p className="text-sm text-slate-400">Use the form on the left to add questions.</p>
                </div>
              ) : (
                <div className="space-y-3 pb-20">
                  {questions.map((q, idx) => (
                    <div
                      key={idx}
                      className={`bg-white p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${
                        editingIndex === idx ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">Q{idx + 1}</span>
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded uppercase">{q.type}</span>
                            <span className="text-xs text-slate-400">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
                          </div>
                          <h3 className="font-semibold text-slate-800 text-sm leading-relaxed break-words">
                            {q.question}
                          </h3>
                          
                          {/* Show Answer Preview */}
                          {q.correctAnswer && (
                            <div className="mt-2 text-xs text-green-600 bg-green-50 inline-block px-2 py-1 rounded border border-green-100">
                              Ans: {q.correctAnswer.length > 30 ? q.correctAnswer.substring(0, 30) + "..." : q.correctAnswer}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => editQuestion(idx)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Icons.Edit />
                          </button>
                          <button
                            onClick={() => triggerDelete(idx)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* OVERLAYS */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Are you sure you want to delete this question?"
        onConfirm={deleteQuestion}
        onCancel={() => setConfirmModal({ isOpen: false, index: null })}
      />
    </div>
  );
}
