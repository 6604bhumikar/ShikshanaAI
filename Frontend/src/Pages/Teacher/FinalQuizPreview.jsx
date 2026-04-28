import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function FinalQuizPreview() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const token = localStorage.getItem("accessToken");

  const stateQuestions = location.state?.questions || null;
  const [questions, setQuestions] = useState(stateQuestions || []);
  const [loading, setLoading] = useState(!stateQuestions);

  useEffect(() => {
    if (!stateQuestions) {
      axios.get(`${API}/courses/${courseId}/final-quiz`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setQuestions(res.data?.quiz?.questions || []))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [stateQuestions, courseId, token]);

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500"><ArrowLeft className="w-5 h-5"/></button>
           <h1 className="text-xl font-bold text-slate-900">Quiz Preview</h1>
        </div>
        <div className="text-sm text-slate-500">Teacher View</div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto bg-white min-h-full shadow-xl rounded-lg border border-slate-200">
           <div className="p-8 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
             <h2 className="text-2xl font-bold text-slate-800">Final Assessment</h2>
             <p className="text-slate-500 mt-1">Read each question carefully before answering.</p>
           </div>

           <div className="p-8 space-y-10">
             {questions.map((q, i) => (
               <div key={i} className="relative pl-6">
                 <div className="absolute left-0 top-0 w-8 h-8 bg-indigo-600 text-white flex items-center justify-center font-bold rounded-full text-sm shadow-sm">
                   {i+1}
                 </div>
                 <h3 className="font-semibold text-lg text-slate-900 mb-4">{q.question}</h3>
                 
                 {q.type === 'mcq' && (
                   <div className="space-y-2 ml-2">
                     {q.options?.map((opt, idx) => (
                       <div key={idx} className={`p-3 rounded-lg border ${opt === q.correctAnswer ? 'bg-green-50 border-green-500 text-green-800' : 'bg-white border-slate-200 hover:bg-slate-50'} flex items-center gap-3 transition-colors`}>
                         {opt === q.correctAnswer && <CheckCircle className="w-4 h-4" />}
                         <span>{opt}</span>
                       </div>
                     ))}
                   </div>
                 )}

                 {q.type === 'true_false' && (
                   <div className="space-y-2 ml-2">
                     {["true", "false"].map(val => (
                       <div key={val} className={`p-3 rounded-lg border ${String(q.correctAnswer) === val ? 'bg-green-50 border-green-500 text-green-800' : 'bg-white border-slate-200'} flex items-center gap-3`}>
                         {String(q.correctAnswer) === val && <CheckCircle className="w-4 h-4"/>}
                         <span className="capitalize">{val === "true" ? "True" : "False"}</span>
                       </div>
                     ))}
                   </div>
                 )}

                 {["fill_blank", "short_answer"].includes(q.type) && (
                   <div className="ml-2 mt-2">
                     <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center gap-2">
                       <CheckCircle className="w-4 h-4" />
                       <span className="font-medium">Answer:</span> {q.correctAnswer}
                     </div>
                   </div>
                 )}

                 {["long_answer", "coding"].includes(q.type) && (
                   <div className="ml-2 mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                     Manual evaluation required.
                   </div>
                 )}
                 
                 <div className="mt-4 flex items-center gap-3 text-xs font-medium text-slate-400">
                   <span className="uppercase tracking-wide">{q.type}</span>
                   <span>•</span>
                   <span>{q.marks} Marks</span>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </main>
    </div>
  );
}
