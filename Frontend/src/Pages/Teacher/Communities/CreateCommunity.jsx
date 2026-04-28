import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { teacherAPI } from "@/lib/api";
import { Plus, ArrowLeft, Users } from "lucide-react";

export default function CreateCommunity() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await teacherAPI.post("/communities", {
        title: name.trim(),
        description: description.trim(),
      });
      navigate("/teacher/communities");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm">
         <div className="max-w-3xl mx-auto flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">Create Community</h1>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center gap-3 mb-8 text-indigo-600">
              <div className="p-3 bg-indigo-50 rounded-xl"><Users className="w-8 h-8" /></div>
              <h2 className="text-2xl font-bold text-slate-900">Community Details</h2>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Community Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. MERN Stack Jan 2026"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Purpose of this community..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none resize-none transition-all"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-lg font-bold text-sm shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Creating..." : <><Plus className="w-4 h-4"/> Create Community</>}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}