import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Image, Hash, DollarSign, CheckCircle } from "lucide-react";

const CATEGORY_OPTIONS = [
  "AI & Machine Learning",
  "Business",
  "Cloud Computing",
  "Cybersecurity",
  "Data Science",
  "Programming & Development",
  "default",
];

export default function EditCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [category, setCategory] = useState("");
  const [isSequential, setIsSequential] = useState(true);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const API = import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher";
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    loadCourse();
  }, []);

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });

  const loadCourse = async () => {
    try {
      const res = await axios.get(`${API}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const course = res.data;
      setTitle(course.title || "");
      setDescription(course.description || "");
      setCategory(course.category || "");
      setIsFree(course.isFree || false);
      setPrice(course.price || "");
      setIsSequential(course.isSequential !== undefined ? course.isSequential : true);
      setThumbnailPreview(course.thumbnail || "");
    } catch (err) {
      console.error("LOAD COURSE ERROR:", err);
      setErrorMsg("Failed to load course details");
    }
  };

  const uploadImageToBackend = async () => {
    if (!thumbnail) return thumbnailPreview;
    return readFileAsDataUrl(thumbnail);
  };

  const updateCourse = async () => {
    setErrorMsg("");
    if (!title.trim()) return setErrorMsg("Course title is required");
    if (!description.trim()) return setErrorMsg("Description required");
    if (!category) return setErrorMsg("Category required");

    setLoading(true);
    try {
      const imageUrl = await uploadImageToBackend();
      await axios.put(`${API}/courses/${courseId}`, {
        title, description, price: isFree ? 0 : price, isFree, category, thumbnail: imageUrl, isSequential,
      }, { headers: { Authorization: `Bearer ${token}` } });

      navigate(`/teacher/courses/${courseId}/units`);
    } catch (err) {
      setErrorMsg("Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* STICKY HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Edit Course</h1>
        </div>
        <button
          onClick={updateCourse}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </header>

      {/* SCROLLABLE FORM */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
          
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: THUMBNAIL & MAIN INFO */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><Image className="w-4 h-4" /> Thumbnail</h2>
                <div className="flex items-start gap-6">
                  <div className="w-48 h-32 shrink-0 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group">
                    {thumbnailPreview ? (
                      <img src={thumbnailPreview} alt="Thumb" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">No Image</span>
                    )}
                    {thumbnailPreview && (
                      <button onClick={() => { setThumbnail(null); setThumbnailPreview(""); }} className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">Remove</button>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block mb-2 text-sm font-medium text-slate-700">Upload New Image</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      if (!e.target.files) return;
                      setThumbnail(e.target.files[0]);
                      setThumbnailPreview(URL.createObjectURL(e.target.files[0]));
                    }} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
                  <input className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="e.g. Advanced React Patterns" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-none" rows={5} placeholder="What will students learn?" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SETTINGS */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <h2 className="font-semibold">Course Settings</h2>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none bg-white" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Select Category</option>
                    {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                    <input type="number" disabled={isFree} className={`w-full pl-7 border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none ${isFree ? 'bg-slate-100 text-slate-400' : ''}`} value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                </div>

                <label className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">Free Course</span>
                  <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" checked={isFree} onChange={() => setIsFree(!isFree)} className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-2 right-5" />
                    <div className={`toggle-label block overflow-hidden h-6 rounded-full ${isFree ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                  </div>
                </label>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <label className="flex items-start justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">Sequential Content</p>
                    <p className="text-xs text-slate-500 mt-1">Unlock units one by one</p>
                  </div>
                  <input type="checkbox" checked={isSequential} onChange={() => setIsSequential(!isSequential)} className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" />
                </label>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
