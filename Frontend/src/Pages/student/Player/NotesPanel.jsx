import React, { useEffect, useState, useCallback } from "react";
import { studentAPI } from "@/lib/api";
import { 
  Notebook, 
  Clock, 
  Plus, 
  AlertCircle, 
  Loader,
  Trash2,
  Edit3,
  X,
  Save
} from "lucide-react";

export default function NotesPanel({ courseId, isMobile = false }) {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState("");

  /* =========================
     LOAD NOTES
  ========================= */
  const loadNotes = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError("");
      const res = await studentAPI.get(`/courses/${courseId}/notes`);
      setNotes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load notes", err);
      setError("Failed to load notes. Please try again later.");
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  /* =========================
     SAVE NOTE
  ========================= */
  const saveNote = async () => {
    if (!content.trim() || saving) return;

    try {
      setSaving(true);
      setError("");
      
      await studentAPI.post(`/courses/${courseId}/notes`, {
        content: content.trim()
      });

      setContent("");
      await loadNotes();
    } catch (err) {
      console.error("Failed to save note", err);
      setError(err.response?.data?.message || "Failed to save note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     UPDATE NOTE
  ========================= */
  const updateNote = async (noteId) => {
    if (!editContent.trim() || saving) return;

    try {
      setSaving(true);
      setError("");
      
      await studentAPI.put(`/courses/${courseId}/notes/${noteId}`, {
        content: editContent.trim()
      });

      setEditingNoteId(null);
      setEditContent("");
      await loadNotes();
    } catch (err) {
      console.error("Failed to update note", err);
      setError(err.response?.data?.message || "Failed to update note. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     DELETE NOTE
  ========================= */
  const deleteNote = async (noteId) => {
    if (window.confirm("Delete this note? This cannot be undone.")) {
      try {
        await studentAPI.delete(`/courses/${courseId}/notes/${noteId}`);
        await loadNotes();
      } catch (err) {
        console.error("Failed to delete note", err);
        setError("Failed to delete note. Please try again.");
      }
    }
  };

  /* =========================
     START EDITING
  ========================= */
  const startEditing = (note) => {
    setEditingNoteId(note._id);
    setEditContent(note.content);
  };

  /* =========================
     FORMAT DATE - Simplified for Mobile
  ========================= */
  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMinutes = Math.round(diffHours * 60);
      return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
      return `${Math.round(diffHours)}h ago`;
    }
    // Mobile: shorter date format
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: isMobile ? undefined : 'numeric'
    });
  };

  return (
    <div className="w-full">
      {/* Header - MOBILE OPTIMIZED */}
      <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <div className="bg-indigo-100 p-2 rounded-xl sm:p-2.5 flex-shrink-0">
          <Notebook className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
            My Notes
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 line-clamp-2">
            Capture insights as you learn
          </p>
        </div>
      </div>

      {/* Create Note Card - MOBILE SIMPLIFIED */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-8">
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 flex-shrink-0" />
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Add New Note</h3>
          </div>
        </div>
        
        <div className="p-4 sm:p-5">
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 text-red-700 rounded-lg flex items-start sm:items-center gap-2 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span>{error}</span>
            </div>
          )}
          
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError("");
            }}
            className="w-full px-3 sm:px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[100px] sm:min-h-[120px] resize-y text-sm sm:text-base"
            placeholder="Jot down your thoughts..."
            aria-label="New note content"
          />
          
          <div className="mt-3 sm:mt-4 flex justify-end">
            <button
              onClick={saveNote}
              disabled={saving || !content.trim()}
              className={`w-full sm:w-auto px-4 py-3 rounded-xl font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 min-h-[44px] touch-manipulation ${
                saving || !content.trim()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-sm active:scale-[0.99]"
              }`}
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Save Note
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          // Skeleton Loaders - Mobile Optimized
          <>
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse"
              >
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2 sm:mb-3"></div>
                <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-full mb-1.5 sm:mb-2"></div>
                <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-5/6 mb-3 sm:mb-4"></div>
                <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </>
        ) : notes.length === 0 ? (
          // Empty State - Simplified
          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 p-8 sm:p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-indigo-50 mb-3 sm:mb-4">
              <Notebook className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">No notes yet</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto px-2">
              Start taking notes during lessons. They'll appear here, organized by course.
            </p>
          </div>
        ) : (
          // Notes Grid - Single column on mobile, 2 on md+
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
            {notes.map((note) => (
              <article
                key={note._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {editingNoteId === note._id ? (
                  // Edit Mode - Mobile Optimized
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 text-sm">Editing Note</h4>
                      <button
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditContent("");
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        aria-label="Cancel editing"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px] text-sm mb-3"
                      autoFocus
                      placeholder="Edit your note..."
                    />
                    
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditContent("");
                        }}
                        className="px-4 py-2.5 text-gray-600 hover:text-gray-800 transition-colors text-sm min-h-[40px]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => updateNote(note._id)}
                        disabled={saving || !editContent.trim()}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm flex items-center gap-1.5 min-h-[40px]"
                      >
                        {saving ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode - Simplified for Mobile
                  <>
                    <div className="p-4">
                      {/* Note Content - Line clamped on mobile */}
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm line-clamp-6 sm:line-clamp-none">
                        {note.content}
                      </p>
                    </div>
                    
                    {/* Footer: Date + Actions */}
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{formatDate(note.createdAt)}</span>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditing(note)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          aria-label="Edit note"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteNote(note._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          aria-label="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}