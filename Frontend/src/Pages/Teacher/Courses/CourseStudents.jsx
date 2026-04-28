import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { User, ArrowLeft, Loader } from "lucide-react";

export default function CourseStudents() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${API}/courses/${courseId}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data.students || []);
      } catch (err) {
        console.error("FETCH STUDENTS ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [courseId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        <Loader className="animate-spin mr-2" /> Loading students...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Enrolled Students</h1>
            <p className="text-xs text-slate-500">{students.length} Total Enrolled</p>
          </div>
        </div>
      </header>

      {/* SCROLLABLE TABLE */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {students.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No students enrolled yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="p-4 pl-6">Student</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4 text-center pr-6">Final Quiz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {s.name?.charAt(0) || "U"}
                        </div>
                        <span className="font-medium text-slate-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">{s.email}</td>
                    <td className="p-4 w-1/4">
                      <div className="flex items-center justify-between mb-1 text-xs font-medium text-slate-600">
                        <span>{s.progress ?? 0}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${s.progress ?? 0}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-center pr-6">
                      {s.finalQuiz?.attempted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {s.finalQuiz.percentage}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
