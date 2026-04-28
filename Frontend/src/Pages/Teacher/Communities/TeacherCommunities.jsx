import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, MessageSquare, Users, Clock, CheckCircle } from "lucide-react";
import { teacherAPI } from "@/lib/api";

export default function TeacherCommunities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await teacherAPI.get("/communities");
      setCommunities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load communities");
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">My Communities</h1>
                <p className="text-xs text-slate-500">Manage learning groups</p>
              </div>
           </div>
           <Link to="/teacher/communities/create" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm transition-all">
              <Plus size={18} /> Create New
           </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {error && <p className="text-red-500 text-center mb-6">{error}</p>}
          
          {communities.length === 0 ? (
             <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                <Users className="w-16 h-16 mb-4 text-slate-300" />
                <p className="text-slate-500 font-medium">No communities created yet.</p>
             </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {communities.map((c) => (
                <div key={c._id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-64">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-white rounded-t-xl">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    {c.isApproved ? (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-200">
                        <CheckCircle className="w-3 h-3 inline mr-1" /> Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full border border-yellow-200">
                        <Clock className="w-3 h-3 inline mr-1" /> Pending
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{c.title}</h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{c.description}</p>
                    
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center text-xs text-slate-400 gap-1.5">
                        <Users className="w-3.5 h-3.5" /> {c.members?.length ?? 0} Members
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                        {c.isApproved ? (
                           <Link to={`/teacher/communities/${c._id}`} className="flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 py-2 rounded-lg transition-colors">
                             <MessageSquare size={14} /> Chat
                           </Link>
                        ) : (
                           <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 py-2 rounded-lg bg-slate-50 cursor-not-allowed">
                             <Clock size={14} /> Locked
                           </div>
                        )}
                        
                        {c.isApproved ? (
                          <Link to={`/teacher/communities/${c._id}/requests`} className="flex items-center justify-center text-xs font-medium text-slate-600 hover:bg-slate-100 py-2 rounded-lg transition-colors">
                             Requests
                          </Link>
                        ) : (
                           <div className="text-xs text-slate-400 italic text-center py-2">
                             Wait for approval
                           </div>
                        )}
                      </div>
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