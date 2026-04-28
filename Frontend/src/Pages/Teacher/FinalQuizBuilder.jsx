import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Edit2, Trash2, Save, X, Plus, ArrowLeft } from "lucide-react";

const QUESTION_TYPES = [
  { value: "mcq", label: "Multiple Choice" },
  { value: "true_false", label: "True / False" },
  { value: "fill_blank", label: "Fill in the Blank" },
  { value: "short_answer", label: "Short Answer" },
  { value: "long_answer", label: "Long Answer (Manual)" },
  { value: "coding", label: "Coding (Manual)" },
];

export default function FinalQuizBuilder() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const token = localStorage.getItem("accessToken");

  const emptyQuestion = { question: "", type: "mcq", options: ["", "", "", ""], correctAnswer: "", marks: 1 };
  
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState(emptyQuestion);
  const [loading, setLoading] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editQ, setEditQ] = useState(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await axios.get(`${API}/courses/${courseId}/final-quiz`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setQuestions(res.data?.quiz?.questions?.map(q => ({ 
          ...q, 
          options: q.options?.length ? q.options : ["", "", "", ""] 
        })) || []);
      } catch (err) { 
        console.error(err); 
        setQuestions([]); 
      } finally { 
        setLoading(false); 
      }
    };
    loadQuiz();
  }, [courseId, token]);

  // FIXED: Handles type change WITHOUT remounting inputs
  const changeType = (type, isForNew) => {
    const base = { 
      ...emptyQuestion, 
      type, 
      options: type === "mcq" ? ["", "", "", ""] : [], 
      correctAnswer: "" 
    };
    if (isForNew) setNewQ(base);
    else setEditQ(base);
  };

  const addQuestion = () => {
    if (!newQ.question.trim()) return alert("Question required");
    setQuestions([...questions, { ...newQ, marks: Number(newQ.marks) }]);
    setNewQ(emptyQuestion);
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditQ({ ...questions[index] });
  };

  const saveEdit = () => {
    if (!editQ.question.trim()) return alert("Question required");
    const updated = [...questions];
    updated[editingIndex] = { ...editQ, marks: Number(editQ.marks) };
    setQuestions(updated);
    setEditingIndex(null);
    setEditQ(null);
  };

  const deleteQuestion = (index) => {
    if (!window.confirm("Delete?")) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const saveQuiz = async () => {
    if (!questions.length) return alert("Add questions first");
    const payload = questions.map(q => ({
      ...q,
      correctAnswer: ["long_answer", "coding"].includes(q.type) ? null : 
                   q.type === "true_false" ? (q.correctAnswer === true || q.correctAnswer === "true") : 
                   q.correctAnswer
    }));
    try {
      await axios.put(`${API}/courses/${courseId}/final-quiz`, { questions: payload }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      navigate(`/teacher/my-courses`);
    } catch (err) { 
      alert("Failed to save"); 
    }
  };

  // FIXED: Helper function (NOT a React component) to render form JSX
  // Prevents remounting by keeping inputs in parent component's render tree
  const renderQuestionForm = (data, setData, onSubmit, onCancel, isForNew) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">
          {isForNew ? "Add Question" : "Edit Question"}
        </h3>
        {!isForNew && onCancel && (
          <button 
            onClick={onCancel} 
            className="text-xs text-slate-500 underline"
          >
            Cancel
          </button>
        )}
      </div>
      
      <textarea
        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        rows={3}
        placeholder="Question text..."
        value={data.question}
        onChange={e => setData({ ...data, question: e.target.value })}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <select
          className="border border-slate-300 rounded-lg p-2.5 text-sm bg-white"
          value={data.type}
          onChange={e => changeType(e.target.value, isForNew)} // Critical fix
        >
          {QUESTION_TYPES.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          className="border border-slate-300 rounded-lg p-2.5 text-sm"
          placeholder="Marks"
          value={data.marks}
          onChange={e => setData({ ...data, marks: Math.max(1, Number(e.target.value)) })}
        />
      </div>
      
      {data.type === "mcq" && (
        <div className="space-y-2">
          {data.options.map((opt, i) => (
            <input
              key={`mcq-opt-${i}`} // Stable key prefix
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={e => {
                const opts = [...data.options];
                opts[i] = e.target.value;
                setData({ ...data, options: opts });
              }}
            />
          ))}
          <select
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-indigo-50"
            value={data.correctAnswer}
            onChange={e => setData({ ...data, correctAnswer: e.target.value })}
          >
            <option value="">Select Correct Option</option>
            {data.options
              .filter(opt => opt.trim())
              .map((opt, i) => (
                <option key={`mcq-correct-${i}`} value={opt}>
                  {opt}
                </option>
              ))}
          </select>
        </div>
      )}

      {data.type === "true_false" && (
        <select
          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
          value={data.correctAnswer}
          onChange={e => setData({ ...data, correctAnswer: e.target.value })}
        >
          <option value="">Select</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      )}

      {["fill_blank", "short_answer"].includes(data.type) && (
        <textarea
          className="w-full border border-slate-300 rounded-lg p-3 text-sm"
          rows={2}
          placeholder="Correct answer..."
          value={data.correctAnswer}
          onChange={e => setData({ ...data, correctAnswer: e.target.value })}
        />
      )}

      {["long_answer", "coding"].includes(data.type) && (
        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs">
          This question requires manual evaluation.
        </div>
      )}

      <button
        onClick={onSubmit}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isForNew ? (
          <>
            <Plus className="w-4 h-4" /> Add Question
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> Save Changes
          </>
        )}
      </button>
    </div>
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Final Quiz Builder</h1>
          </div>
        </div>
        <button 
          onClick={saveQuiz} 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Quiz
        </button>
      </header>

      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-65px)]">
        {/* LEFT: FORM */}
        <div className="lg:col-span-5 bg-white border-r border-slate-200 p-6 overflow-y-auto">
          {editingIndex === null
            ? renderQuestionForm(newQ, setNewQ, addQuestion, null, true)
            : renderQuestionForm(
                editQ,
                setEditQ,
                saveEdit,
                () => setEditingIndex(null),
                false
              )}
        </div>

        {/* RIGHT: LIST */}
        <div className="lg:col-span-7 bg-slate-50/50 p-6 overflow-y-auto">
          <h3 className="font-bold text-slate-800 mb-4">Questions ({questions.length})</h3>
          <div className="space-y-3">
            {questions.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No questions added.
              </div>
            )}
            {questions.map((q, i) => (
              <div
                key={`question-${i}`} // Stable key
                className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${
                  editingIndex === i ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">
                        Q{i + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {QUESTION_TYPES.find(t => t.value === q.type)?.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 bg-green-50 text-green-700 px-2 py-0.5 rounded">
                        {q.marks} mks
                      </span>
                    </div>
                    <p className="font-medium text-slate-900 text-sm">{q.question}</p>
                    {q.type === 'mcq' && (
                      <ul className="mt-2 text-xs text-slate-500 space-y-1">
                        {q.options.map((o, idx) => (
                          <li
                            key={`q-${i}-opt-${idx}`} // Stable key
                            className={o === q.correctAnswer ? "text-green-600 font-bold" : ""}
                          >
                            {idx + 1}. {o}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(i)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteQuestion(i)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
