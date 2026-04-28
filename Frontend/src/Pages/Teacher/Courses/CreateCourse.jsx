import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* 🔥 MUST MATCH BACKEND ENUM EXACTLY */
const CATEGORY_OPTIONS = [
  "AI & Machine Learning",
  "Business",
  "Cloud Computing",
  "Cybersecurity",
  "Data Science",
  "Programming & Development",
  "default",
];

export default function CreateCourse() {
  const navigate = useNavigate();
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

  const API = import.meta.env.VITE_API_TEACHER;
  const token = localStorage.getItem("accessToken");

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });

  /* ===============================
     CREATE COURSE
  =============================== */
  const createCourse = async () => {
    setErrorMsg("");
    if (!title.trim()) return setErrorMsg("Course title is required");
    if (!description.trim()) return setErrorMsg("Course description is required");
    if (description.trim().length < 10) return setErrorMsg("Course description must be at least 10 characters");
    if (!category) return setErrorMsg("Course category is required");
    if (!thumbnail) return setErrorMsg("Course thumbnail is required");

    setLoading(true);
    try {
      const imageUrl = await readFileAsDataUrl(thumbnail);
      const res = await axios.post(
        `${API}/courses`,
        {
          title,
          description,
          price: isFree ? 0 : price,
          isFree,
          category,
          thumbnail: imageUrl,
          isSequential,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/teacher/courses/${res.data.course._id}/units`);
    } catch (err) {
      console.error("CREATE COURSE ERROR:", err);
      setErrorMsg(err?.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Create New Course</h1>
          <p className="text-indigo-100 mt-1 text-sm">Build your curriculum step by step</p>
        </div>

        {/* Form Container */}
        <div className="p-6 md:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start">
              <span className="mr-2">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Thumbnail <span className="text-red-500">*</span>
              </label>
              {thumbnailPreview ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnail(null);
                      setThumbnailPreview("");
                    }}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-red-50 text-red-600 p-1.5 rounded-full shadow-sm transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Remove thumbnail"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="thumbnailInput"
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors bg-gray-50"
                >
                  <div className="text-center px-4">
                    <div className="inline-block p-3 bg-indigo-50 rounded-full mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">Upload course image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB • Recommended 16:9 ratio</p>
                  </div>
                  <input
                    id="thumbnailInput"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setThumbnail(e.target.files[0]);
                        setThumbnailPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Advanced React Patterns"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Engage students with a compelling course description..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-y"
              />
            </div>

            {/* Category & Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition appearance-none bg-white"
                >
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.filter(cat => cat !== "default").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isFree ? "Free Course" : "Price"} <span className="text-red-500">*</span>
                </label>
                {isFree ? (
                  <div className="w-full px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-800 font-medium">
                    This course is free
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Free Course Toggle */}
            <div 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => setIsFree(!isFree)}
            >
              <div>
                <p className="font-medium text-gray-800">Offer as free course</p>
                <p className="text-sm text-gray-500 mt-1">Students can enroll without payment</p>
              </div>
              <div className={`relative inline-block w-11 h-6 flex-shrink-0 transition duration-200 ease-in-out ${
                isFree ? 'bg-green-500' : 'bg-gray-300'
              } rounded-full`}>
                <div className={`absolute top-0.5 left-0.5 bg-white border border-gray-200 rounded-full h-5 w-5 transform transition-transform duration-200 ease-in-out ${
                  isFree ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </div>

            {/* Content Drip Toggle */}
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-medium text-indigo-800">Sequential Content Unlocking</p>
                  <p className="text-sm text-indigo-600 mt-1">
                    Students unlock units progressively after completing previous ones
                  </p>
                </div>
                <div className={`relative inline-block w-11 h-6 flex-shrink-0 transition duration-200 ease-in-out ${
                  isSequential ? 'bg-indigo-600' : 'bg-gray-300'
                } rounded-full cursor-pointer`} onClick={() => setIsSequential(!isSequential)}>
                  <div className={`absolute top-0.5 left-0.5 bg-white border border-gray-200 rounded-full h-5 w-5 transform transition-transform duration-200 ease-in-out ${
                    isSequential ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={createCourse}
              disabled={loading}
              className={`w-full py-3.5 px-6 text-lg font-semibold rounded-xl transition-all duration-200 ${
                loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating course...
                </span>
              ) : (
                "Create Course & Add Units →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
