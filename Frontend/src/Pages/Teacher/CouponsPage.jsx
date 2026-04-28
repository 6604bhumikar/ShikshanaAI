import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Percent, Trash2, Tag, ArrowLeft, RefreshCw } from "lucide-react";

export default function CouponsPage() {
  const navigate = useNavigate();
  const API = `${import.meta.env.VITE_API_TEACHER || "http://localhost:5000/api/teacher"}/courses`;
  const token = localStorage.getItem("accessToken");

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiry, setExpiry] = useState("");

  useEffect(() => {
    axios.get(`${API}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setCourses(res.data))
      .catch((err) => console.error(err));
  }, [token]);

  const loadCoupons = async () => {
    if (!courseId) return setCoupons([]);
    try {
      const res = await axios.get(`${API}/${courseId}/coupons`, { headers: { Authorization: `Bearer ${token}` } });
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setCoupons([]);
    }
  };

  useEffect(() => { loadCoupons(); }, [courseId]);

  const createCoupon = async () => {
    if (!courseId) return alert("Select a course");
    if (!code || !discount || !expiry) return alert("All fields required");
    const discountValue = Number(discount);
    if (!Number.isFinite(discountValue) || discountValue <= 0 || discountValue > 100) {
      return alert("Discount must be between 1 and 100 percent");
    }
    try {
      await axios.post(`${API}/${courseId}/coupons`, { code: code.trim(), discount: discountValue, expiry }, { headers: { Authorization: `Bearer ${token}` } });
      setCode(""); setDiscount(""); setExpiry("");
      loadCoupons();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create");
    }
  };

  const deleteCoupon = async (couponId) => {
    if (!window.confirm("Delete coupon?")) return;
    try {
      await axios.delete(`${API}/${courseId}/coupons/${couponId}`, { headers: { Authorization: `Bearer ${token}` } });
      loadCoupons();
    } catch (err) { alert("Failed to delete"); }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm z-10">
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
           <div className="flex items-center gap-4">
             <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Coupons</h1>
              <p className="text-xs text-slate-500">Manage discounts for courses</p>
            </div>
          </div>
          <select
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">Select Course</option>
            {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
          </select>
        </div>
      </header>

      {/* MAIN CONTENT */}
      {courseId ? (
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-73px)]">
          
          {/* LEFT: CREATE FORM */}
          <div className="lg:col-span-4 bg-white border-r border-slate-200 p-6 overflow-y-auto">
            <div className="sticky top-0 space-y-6">
              <h2 className="font-bold text-slate-800 flex items-center gap-2"><Tag className="w-5 h-5" /> Create Coupon</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Coupon Code</label>
                  <input className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono" placeholder="SUMMER2023" value={code} onChange={e => setCode(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Discount (%)</label>
                  <input type="number" min="1" max="100" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="20" value={discount} onChange={e => setDiscount(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Expiry Date</label>
                  <input type="date" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" value={expiry} onChange={e => setExpiry(e.target.value)} />
                </div>
                <button onClick={createCoupon} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2">
                  <Percent className="w-4 h-4" /> Generate Coupon
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: LIST */}
          <div className="lg:col-span-8 p-6 overflow-y-auto bg-slate-50/50">
            <h3 className="font-bold text-slate-800 mb-4">Active Coupons ({coupons.length})</h3>
            <div className="grid gap-4">
              {coupons.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                  <RefreshCw className="w-8 h-8 mb-2 opacity-20" />
                  <p>No coupons found.</p>
                </div>
              )}
              {coupons.map((c) => (
                <div key={c._id} className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-5 flex justify-between items-center relative overflow-hidden group hover:border-indigo-300 transition-colors">
                  <div className="absolute top-0 left-0 h-full w-8 bg-indigo-50 border-r border-dashed border-slate-300 flex items-center justify-center text-indigo-500">
                    <div className="transform -rotate-90 text-xs font-bold tracking-widest uppercase whitespace-nowrap">Offer</div>
                  </div>
                  <div className="pl-6">
                    <div className="text-2xl font-bold text-indigo-600">{c.discountPercent}% OFF</div>
                    <div className="text-lg font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded inline-block mt-1">{c.code}</div>
                    {c.expiresAt && <div className="text-xs text-slate-500 mt-2">Expires: {new Date(c.expiresAt).toDateString()}</div>}
                  </div>
                  <button onClick={() => deleteCoupon(c._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500">
           Please select a course from the dropdown above.
        </div>
      )}
    </div>
  );
}
