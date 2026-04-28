import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { teacherAPI } from "@/lib/api";
import { Users, ArrowLeft, Check, X } from "lucide-react";

export default function CommunityRequests() {
  const { communityId } = useParams();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (communityId) fetchRequests();
  }, [communityId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await teacherAPI.get(`/communities/${communityId}/join-requests`);
      setRequests(res.data?.joinRequests || []);
    } catch (err) {
      console.error("Failed to load join requests", err);
      setError("Unable to load join requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (studentId, action) => {
    try {
      await teacherAPI.post(`/communities/${communityId}/join/${studentId}/${action}`);
      fetchRequests();
    } catch (err) {
      alert("Action failed. Please try again.");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/teacher/communities" className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Join Requests</h1>
              <p className="text-xs text-slate-500">Manage community access</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No pending requests.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                            {student.name?.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{student.email}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAction(student._id, "approve")}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleAction(student._id, "reject")}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Reject"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}