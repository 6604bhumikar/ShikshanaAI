import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, ArrowLeft, Edit3 } from "lucide-react";

export default function TeacherFinalQuizEditor() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const token = localStorage.getItem("accessToken");

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      const res = await axios.get(`${API}/courses/${courseId}/final-quiz`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const existingQuestions = res.data?.questions || res.data?.finalQuiz?.questions || [];
      setQuestions(existingQuestions);
    } catch (err) {
      console.error("LOAD ERROR:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", type: "mcq", options: ["", "", "", ""], correctAnswer: "", marks: 1 },
    ]);
    // Scroll to bottom
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const removeQuestion = (index) => {
    if (!window.confirm("Remove this question?")) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const saveQuiz = async () => {
    if (questions.length === 0) return alert("Add at least one question");
    try {
      await axios.put(`${API}/courses/${courseId}/final-quiz`, { questions }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Quiz updated successfully!");
      navigate(`/teacher/courses/${courseId}/final-quiz`);
    } catch (err) {
      alert("Failed to save quiz");
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Edit Final Quiz</h1>
            <p className="text-xs text-slate-500">Inline Editor</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={addQuestion} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 font-medium text-sm">
            <Plus className="w-4 h-4" /> Add Question
          </button>
          <button onClick={saveQuiz} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium text-sm shadow-sm">
            <Save className="w-4 h-4" /> Save Quiz
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          {questions.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
              <Edit3 className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500">Quiz is empty. Add questions above.</p>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                   <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">Q{idx + 1}</span>
                   <button onClick={() => removeQuestion(idx)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>

                <div className="space-y-4">
                  <input
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-medium"
                    value={q.question}
                    onChange={(e) => handleUpdate(idx, "question", e.target.value)}
                    placeholder="Enter question text"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={q.type}
                      onChange={(e) => handleUpdate(idx, "type", e.target.value)}
                    >
                      <option value="mcq">MCQ</option>
                      <option value="text">Text</option>
                      <option value="fill">Fill in blank</option>
                      <option value="conditional">Yes / No</option>
                      <option value="match">Match pairs</option>
                    </select>
                    <input
                      type="number"
                      className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Marks"
                      value={q.marks}
                      onChange={(e) => handleUpdate(idx, "marks", Number(e.target.value))}
                    />
                  </div>

                  {q.type === "mcq" && (
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <input
                          key={i}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const updatedOptions = [...q.options];
                            updatedOptions[i] = e.target.value;
                            handleUpdate(idx, "options", updatedOptions);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <input
                    className="w-full bg-green-50 border border-green-100 rounded-lg px-4 py-2 text-sm text-green-900 focus:ring-2 focus:ring-green-500 outline-none"
                    value={q.correctAnswer}
                    onChange={(e) => handleUpdate(idx, "correctAnswer", e.target.value)}
                    placeholder="Correct Answer"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
