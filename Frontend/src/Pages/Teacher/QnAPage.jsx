import React, { useEffect, useState } from "react";
import axios from "axios";
import { MessageSquare, Send, CheckCircle, ArrowLeft, User } from "lucide-react";

export default function QnAPage() {
  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const token = localStorage.getItem("accessToken");

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyBox, setReplyBox] = useState({});

  useEffect(() => {
    if (!token) return;
    loadQnA();
  }, [token]);

  const loadQnA = async () => {
    try {
      const res = await axios.get(`${API}/qna`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data || []);
    } catch (err) {
      console.error("Q&A ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (qnaId) => {
    const reply = replyBox[qnaId];
    if (!reply?.trim()) return;

    try {
      await axios.post(
        `${API}/qna/${qnaId}/reply`,
        { reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyBox((prev) => ({ ...prev, [qnaId]: "" }));
      loadQnA();
    } catch (err) {
      console.error("REPLY ERROR:", err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          {/* Placeholder Back Button or Logo */}
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Student Q&A</h1>
            <p className="text-xs text-slate-500">Manage student inquiries</p>
          </div>
        </div>
      </header>

      {/* FEED */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          {questions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
              <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
              <p>No questions asked yet.</p>
            </div>
          ) : (
            questions.map((q) => (
              <div key={q._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Question */}
                <div className="p-5 bg-white">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-base">{q.question}</h3>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        Asked by {q.student?.name || "Student"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Answer or Input */}
                <div className={`p-5 ${q.reply ? "bg-indigo-50/50 border-t border-indigo-100" : "bg-slate-50 border-t border-slate-100"}`}>
                  {q.reply ? (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-indigo-900 mb-1">Instructor</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{q.reply}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0 mt-2">
                        <Send className="w-4 h-4" />
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          placeholder="Write a reply..."
                          value={replyBox[q._id] || ""}
                          onChange={(e) => setReplyBox({ ...replyBox, [q._id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && sendReply(q._id)}
                        />
                        <button
                          onClick={() => sendReply(q._id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
