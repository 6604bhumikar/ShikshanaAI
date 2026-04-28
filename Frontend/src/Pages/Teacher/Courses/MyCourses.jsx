import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, Edit, Package, FileText, Brain, BarChart2, Send, Trash2 } from "lucide-react";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data || []);
    } catch (err) {
      console.error("Fetch courses failed", err);
    }
  };

  const submitForReview = async (courseId) => {
    try {
      await axios.post(`${API}/courses/${courseId}/submit`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourses();
    } catch (err) {
      console.error("Submit failed", err);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await axios.delete(`${API}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourses();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: "bg-slate-100 text-slate-600 border-slate-200",
      review: "bg-yellow-50 text-yellow-700 border-yellow-100",
      published: "bg-green-50 text-green-700 border-green-100",
    };
    return (
      <span className={`text-xs font-bold px-2 py-1 rounded border ${styles[status] || styles.draft} uppercase tracking-wide`}>
        {status}
      </span>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Courses</h1>
          <p className="text-xs text-slate-500">{courses.length} courses created</p>
        </div>
        <button
          onClick={() => navigate("/teacher/create-course")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Course
        </button>
      </header>

      {/* COURSE GRID */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {courses.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
              <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No courses yet.</p>
              <p className="text-sm text-slate-400">Create your first course to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {courses.map((course) => (
                <div key={course._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-[380px]">
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    {getStatusBadge(course.status)}
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                      {course.description}
                    </p>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => navigate(`/teacher/courses/${course._id}`)} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors">
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => navigate(`/teacher/courses/${course._id}/units`)} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
                        <Package className="w-3 h-3" /> Units
                      </button>
                      <button onClick={() => navigate(`/teacher/courses/${course._id}/assignments`)} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-pink-50 text-pink-600 text-xs font-medium hover:bg-pink-100 transition-colors">
                        <FileText className="w-3 h-3" /> Assign
                      </button>
                      <button onClick={() => navigate(`/teacher/courses/${course._id}/final-quiz`)} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium hover:bg-amber-100 transition-colors">
                        <Brain className="w-3 h-3" /> Quiz
                      </button>
                      <button onClick={() => navigate(`/teacher/courses/${course._id}/analytics`)} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-purple-50 text-purple-600 text-xs font-medium hover:bg-purple-100 transition-colors">
                        <BarChart2 className="w-3 h-3" /> Stats
                      </button>
                      
                      {course.status === "draft" ? (
                        <button onClick={() => submitForReview(course._id)} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-orange-50 text-orange-600 text-xs font-medium hover:bg-orange-100 transition-colors">
                          <Send className="w-3 h-3" /> Review
                        </button>
                      ) : (
                        <button onClick={() => handleDelete(course._id)} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
