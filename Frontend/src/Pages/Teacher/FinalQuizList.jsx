import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Edit3, Eye, ArrowLeft, FileText } from "lucide-react";

export default function FinalQuizList() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const token = localStorage.getItem("accessToken");

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await axios.get(`${API}/courses/${courseId}/final-quiz`, { headers: { Authorization: `Bearer ${token}` } });
        setQuiz(res.data?.quiz || null);
      } catch (err) { console.error(err); setQuiz(null); }
      finally { setLoading(false); }
    };
    loadQuiz();
  }, [courseId, token]);

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500"><ArrowLeft className="w-5 h-5"/></button>
           <h1 className="text-xl font-bold text-slate-900">Final Quiz</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {!quiz || quiz.questions.length === 0 ? (
             <div className="h-96 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
              <FileText className="w-12 h-12 mb-3 opacity-20" />
              <p>No final quiz configured.</p>
              <button onClick={() => navigate(`/teacher/courses/${courseId}/final-quiz/builder`)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Create Quiz</button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm text-slate-500">Questions: <span className="font-bold text-slate-800">{quiz.questions.length}</span></p>
                  <p className="text-sm text-slate-500">Total Marks: <span className="font-bold text-slate-800">{quiz.totalMarks}</span></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/teacher/courses/${courseId}/final-quiz/builder`)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                    <Edit3 className="w-4 h-4"/> Edit
                  </button>
                  <button onClick={() => navigate(`/teacher/courses/${courseId}/final-quiz/preview`)} className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm font-medium">
                    <Eye className="w-4 h-4"/> Preview
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {quiz.questions.map((q, i) => (
                  <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded text-xs mt-0.5">Q{i+1}</span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 mb-2">{q.question}</p>
                        <div className="flex gap-2 text-xs text-slate-500">
                          <span className="bg-slate-100 px-2 py-1 rounded">{q.type}</span>
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded">{q.marks} marks</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
