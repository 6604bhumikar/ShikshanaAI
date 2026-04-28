import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { 
  PlusIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  FolderOpenIcon,
  ClipboardDocumentCheckIcon
} from "@heroicons/react/24/outline";

export default function AssignmentsManager() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const token = localStorage.getItem("accessToken");
  const [assignments, setAssignments] = useState([]);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxMarks, setMaxMarks] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const res = await axios.get(
        `${API}/courses/${courseId}/assignments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load assignments", err);
      setError("Failed to load assignments. Please try again later.");
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError("Assignment title is required");
      return false;
    }
    if (!maxMarks || isNaN(maxMarks) || Number(maxMarks) <= 0) {
      setError("Valid maximum marks required");
      return false;
    }
    setError("");
    return true;
  };

  const createAssignment = async () => {
    if (!validateForm()) return;
    
    setIsCreating(true);
    setError("");
    
    try {
      await axios.post(
        `${API}/courses/${courseId}/assignments`,
        {
          title,
          description,
          maxMarks: Number(maxMarks),
          dueDate: dueDate || null,
          type: "file",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Reset form
      setTitle("");
      setDescription("");
      setMaxMarks("");
      setDueDate("");
      
      // Refresh assignments
      await loadAssignments();
    } catch (err) {
      console.error("Failed to create assignment", err);
      setError(err.response?.data?.message || "Failed to create assignment. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <DocumentTextIcon className="h-10 w-10 text-indigo-600" />
            <h1 className="ml-3 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Assignments Manager
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create and manage PDF-based assignments. Students submit work as PDF files which you can review and grade directly in the platform.
          </p>
        </div>

        {/* Create Assignment Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-10">
          <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
            <div className="flex items-center">
              <PlusIcon className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">Create New Assignment</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">PDF submission format only</p>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="mb-5 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Week 5 Research Paper"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  aria-required="true"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description & Instructions
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide clear instructions for students. Specify requirements, formatting guidelines, and any resources they should use. Remember: submissions must be PDF files only."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y"
                />
                <p className="mt-1 text-xs text-indigo-600 flex items-center">
                  <DocumentTextIcon className="h-3 w-3 mr-1" /> Students can only submit PDF files
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="maxMarks" className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="maxMarks"
                    type="number"
                    min="1"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    placeholder="e.g., 100"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    aria-required="true"
                  />
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="dueDate"
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={createAssignment}
                disabled={isCreating}
                className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-white shadow-sm transition-all ${
                  isCreating
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                }`}
                aria-busy={isCreating}
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Assignment...
                  </>
                ) : (
                  <>
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Create Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-indigo-600 mr-2" />
              Current Assignments
            </h2>
          </div>
          
          {assignments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
                <FolderOpenIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No assignments created yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Create your first assignment to start collecting student submissions. Students will be able to upload PDF files for you to review and grade.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {assignments.map((assignment) => (
                <div 
                  key={assignment._id} 
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 truncate">
                            {assignment.title}
                          </h3>
                          {assignment.description && (
                            <p className="mt-1 text-gray-600 text-sm line-clamp-2">
                              {assignment.description}
                            </p>
                          )}
                          
                          <div className="mt-3 flex flex-wrap gap-3">
                            <div className="flex items-center text-sm text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                              <span className="font-medium">{assignment.maxMarks} pts</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              Due: {formatDate(assignment.dueDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => navigate(`/teacher/assignments/${assignment._id}/submissions`)}
                        className="w-full md:w-auto flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
                        aria-label={`View submissions for ${assignment.title}`}
                      >
                        <FolderOpenIcon className="-ml-1 mr-1.5 h-4 w-4" />
                        View Submissions
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
  );
}
