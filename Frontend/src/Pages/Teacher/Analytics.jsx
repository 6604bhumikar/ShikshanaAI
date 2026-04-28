import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Users, Trophy, BarChart2, ClipboardList, AlertCircle, Download, 
  ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, ArrowLeft 
} from "lucide-react";

export default function Analytics() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const token = localStorage.getItem("accessToken");

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("progress");

  useEffect(() => {
    if (!courseId) return;
    const load = async () => {
      try {
        const res = await axios.get(`${API}/courses/${courseId}/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(res.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const students = analytics?.students || [];
  const stats = analytics?.stats || {};
  const course = analytics?.course || {};

  const processedStudents = useMemo(() => {
    return [...students]
      .filter(s => {
        if (filter === "pass") return s.status === "Passed";
        if (filter === "fail") return s.status === "Failed";
        if (filter === "attention") return s.units?.some(u => u.quiz?.hasPartialAttempt && !u.quiz.completed);
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "final") {
          const aPct = parseInt(a.finalQuiz?.percentage) || 0;
          const bPct = parseInt(b.finalQuiz?.percentage) || 0;
          return bPct - aPct;
        }
        if (sortBy === "assignments") return (b.assignments?.avgScore || 0) - (a.assignments?.avgScore || 0);
        if (sortBy === "units") {
          const aUnits = a.units?.filter(u => u.quiz?.completed || u.completed).length || 0;
          const bUnits = b.units?.filter(u => u.quiz?.completed || u.completed).length || 0;
          return bUnits - aUnits;
        }
        return (b.progress || 0) - (a.progress || 0);
      })
      .map(s => {
        const unitsWithProgress = s.units?.map(u => ({
          ...u,
          hasProgress: u.quiz?.attempted || u.completed || u.quiz?.questionsAttempted > 0
        })) || [];
        const unitsDone = unitsWithProgress.filter(u => u.quiz?.completed || u.completed).length;
        return {
          ...s,
          unitsWithProgress,
          unitsCompleted: unitsDone,
          totalUnits: s.units?.length || 0,
          unitCompletionRate: s.units?.length ? Math.round((unitsDone / s.units.length) * 100) : 0
        };
      });
  }, [students, filter, sortBy]);

  const SummaryItem = ({ label, value, icon, color }) => {
    const colors = {
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      green: 'bg-green-50 text-green-700 border-green-100',
      blue: 'bg-blue-50 text-blue-700 border-blue-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-100',
      red: 'bg-red-50 text-red-700 border-red-100',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
      gray: 'bg-slate-50 text-slate-700 border-slate-100',
      orange: 'bg-orange-50 text-orange-700 border-orange-100'
    };
    return (
      <div className={`rounded-lg p-3 border ${colors[color] || colors.gray}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {React.cloneElement(icon, { className: "w-4 h-4" })}
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</span>
          </div>
          <span className="text-lg font-bold">{value}</span>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{course.title}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" /> Advanced Analytics
            </p>
          </div>
        </div>
        <button
          onClick={() => {/* Keep original export logic or hook it up */ }}
          className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </header>

      {/* CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* STATS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            <SummaryItem label="Enrolled" value={stats.enrollments} icon={<Users />} color="indigo" />
            <SummaryItem label="Completed" value={stats.completed} icon={<Trophy />} color="green" />
            <SummaryItem label="Avg Progress" value={`${stats.avgProgress}%`} icon={<BarChart2 />} color="blue" />
            <SummaryItem label="Avg Score" value={`${stats.avgAssignmentScore}%`} icon={<ClipboardList />} color="purple" />
            <SummaryItem label="Need Help" value={stats.studentsNeedingAttention} icon={<AlertCircle />} color={stats.studentsNeedingAttention > 0 ? "red" : "green"} />
            <SummaryItem label="Units Done" value={`${Math.round(processedStudents.reduce((sum, s) => sum + s.unitCompletionRate, 0) / (processedStudents.length || 1))}%`} icon={<CheckCircle />} color="emerald" />
            <SummaryItem label="Total Units" value={course.totalUnits} icon={<ClipboardList />} color="gray" />
            <SummaryItem label="Assignments" value={stats.totalAssignments} icon={<ClipboardList />} color="orange" />
          </div>

          {/* CONTROLS (STICKY) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-wrap items-center gap-4 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Filter:</span>
              <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="all">All Students</option>
                <option value="pass">Passed</option>
                <option value="fail">Failed</option>
                <option value="attention">Need Attention</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Sort:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="progress">Overall Progress</option>
                <option value="final">Final Quiz Score</option>
                <option value="assignments">Assignment Avg</option>
                <option value="units">Units Completed</option>
              </select>
            </div>
            <div className="ml-auto text-sm text-slate-500 font-medium">
              {processedStudents.length} / {students.length} shown
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4 text-center">Progress</th>
                    <th className="px-6 py-4 text-center">Units</th>
                    <th className="px-6 py-4 text-center">Assignments</th>
                    <th className="px-6 py-4 text-center">Final Quiz</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedStudents.map((student, index) => (
                    <React.Fragment key={index}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.email || "—"}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-slate-700">{student.progress}%</span>
                            <div className="w-20 bg-slate-200 rounded-full h-1.5 mt-1">
                              <div className={`h-1.5 rounded-full transition-all ${student.progress >= 80 ? 'bg-green-500' : student.progress >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${student.progress}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.unitCompletionRate === 100 ? 'bg-green-100 text-green-800' : student.unitCompletionRate > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'}`}>
                            {student.unitsCompleted}/{student.totalUnits}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-xs">
                            <span className="block text-slate-700 font-medium">{student.assignments?.submitted || 0}/{student.assignments?.total || 0}</span>
                            <span className={`text-xs ${student.assignments?.avgScore >= 70 ? 'text-green-600' : student.assignments?.avgScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {student.assignments?.avgScore || 0}% avg
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="font-bold text-slate-900">{student.finalQuiz?.percentage || "N/A"}</div>
                          {student.finalQuiz?.passed !== undefined && (
                            <span className={`text-xs flex items-center justify-center gap-1 ${student.finalQuiz.passed ? 'text-green-600' : 'text-red-600'}`}>
                              {student.finalQuiz.passed ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {student.finalQuiz.passed ? "Pass" : "Fail"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${student.status === 'Passed' ? 'bg-green-100 text-green-800' : student.status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => setExpandedRow(expandedRow === index ? null : index)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                            {expandedRow === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </td>
                      </tr>
                      
                      {/* EXPANDED DETAILS */}
                      {expandedRow === index && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                              <table className="w-full text-xs">
                                <thead className="bg-slate-100 text-slate-600">
                                  <tr>
                                    <th className="px-4 py-2 text-left">Unit</th>
                                    <th className="px-4 py-2 text-center">Score</th>
                                    <th className="px-4 py-2 text-center">Result</th>
                                    <th className="px-4 py-2 text-center">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {student.unitsWithProgress?.map((unit, uIdx) => {
                                    const isDone = unit.quiz?.completed || unit.completed;
                                    const quizPass = unit.quiz?.percentage >= 40;
                                    return (
                                      <tr key={uIdx} className="border-t border-slate-100">
                                        <td className="px-4 py-2 font-medium text-slate-700">{unit.unitTitle}</td>
                                        <td className="px-4 py-2 text-center font-bold">{unit.quiz?.percentage || 0}%</td>
                                        <td className="px-4 py-2 text-center">
                                          {unit.quiz ? (
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${quizPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                              {quizPass ? 'PASS' : 'FAIL'}
                                            </span>
                                          ) : <span className="text-slate-400">—</span>}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                          {isDone ? <span className="text-green-600 font-medium flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" />Done</span> : 
                                           unit.hasProgress ? <span className="text-blue-600 font-medium flex items-center justify-center gap-1"><Clock className="w-3 h-3" />Prog</span> : 
                                           <span className="text-slate-400">—</span>}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            {processedStudents.length === 0 && (
              <div className="p-8 text-center text-slate-500">No students match filters.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
