import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { User, CheckCircle, Clock, ArrowLeft } from "lucide-react";

export default function StudentsList() {
  const [params] = useSearchParams();
  const courseId = params.get("id");
  
  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const accessToken = localStorage.getItem("accessToken");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId && accessToken) loadStudents();
  }, [courseId, accessToken]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/courses/${courseId}/students`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Enrolled Students</h1>
            <p className="text-xs text-slate-500">{students.length} Total</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-3 pb-20">
          {students.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No students enrolled yet.</p>
            </div>
          ) : (
            students.map((s, i) => {
              const completedUnits = s.progressDetails?.completedUnits || 0;
              const totalUnits = s.progressDetails?.totalUnits || 0;
              const isCompleted = totalUnits > 0 && completedUnits === totalUnits;
              const percent = totalUnits > 0 
                ? Math.round((completedUnits / totalUnits) * 100) 
                : Number(s.progress || 0);

              return (
                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {s.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{s.name}</h3>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Progress Bar */}
                    <div className="hidden md:flex flex-col items-end w-32">
                      <span className="text-xs font-medium text-slate-700 mb-1">{completedUnits} / {totalUnits} Units</span>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200">
                      {isCompleted ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-green-700">Completed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-orange-500" />
                          <span className="text-orange-700">In Progress</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
