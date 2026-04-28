import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { studentAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Tag, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Loader,
  ArrowLeft,
  Ticket,
  Percent,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';

const roundCurrency = (value) => Math.round(Number(value || 0) * 100) / 100;

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const couponInputRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [error, setError] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const API_PUBLIC = import.meta.env.VITE_API_PUBLIC || "http://localhost:5000/api/public";
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  /* ================= LOAD COURSE ================= */
  useEffect(() => {
    if (courseId) loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(
        `${API_PUBLIC}/courses/${courseId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setCourse(res.data.course);
      setAccess(res.data.access);
    } catch (err) {
      console.error("Failed to load course:", err);
      setError("Failed to load course details. Please try again.");
      toast.error("Course not found. Redirecting to catalog...", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      setTimeout(() => navigate("/catalog"), 3500);
    } finally {
      setLoading(false);
    }
  };

  /* ================= APPLY COUPON ================= */
  const applyCoupon = async () => {
    if (!coupon.trim()) {
      toast.error("Please enter a coupon code", {
        position: "top-center",
        autoClose: 2000,
        theme: "colored"
      });
      couponInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      
      const res = await studentAPI.post(
        "/coupons/validate",
        {
          code: coupon.trim(),
          courseId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDiscountPercent(res.data.discountPercent || 0);
      setAppliedCoupon(coupon.trim());
      setCoupon("");

      toast.success(`Coupon applied! ${res.data.discountPercent}% discount`, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    } catch (err) {
      console.error("Coupon validation error:", err);
      setDiscountPercent(0);
      setAppliedCoupon("");
      
      const message = err?.response?.data?.message || "Invalid or expired coupon";
      toast.error(message, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= REMOVE COUPON ================= */
  const removeCoupon = () => {
    setDiscountPercent(0);
    setAppliedCoupon("");
    setCoupon("");
    toast.info("Coupon removed", {
      position: "top-center",
      autoClose: 2000,
      theme: "colored"
    });
  };

  /* ================= RAZORPAY SCRIPT ================= */
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  /* ================= PAYMENT ================= */
  const handlePayment = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.info("Please login to complete your purchase", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored"
      });
      navigate("/login", { state: { from: `/checkout/${courseId}` } });
      return;
    }

    if (access.enrolled) {
      toast.info("You are already enrolled in this course.", {
        position: "top-center",
        autoClose: 2500,
        theme: "colored"
      });
      navigate(`/player/${courseId}`);
      return;
    }

    // Handle free enrollment
    if (isFree || finalPrice === 0) {
      try {
        setProcessing(true);

        await studentAPI.post(
          "/payments/create-order",
          {
            courseId,
            couponCode: appliedCoupon || undefined,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Enrolled successfully! Redirecting to course...", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored"
        });

        setTimeout(() => navigate(`/player/${courseId}`), 3200);
      } catch (err) {
        console.error("Free enrollment error:", err);
        toast.error("Failed to enroll. Please try again.", {
          position: "top-center",
          autoClose: 4000,
          theme: "colored"
        });
      } finally {
        setProcessing(false);
      }
      return;
    }

    // Handle paid enrollment
    setProcessing(true);
    setIsPaymentOpen(true);
    
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      const orderRes = await studentAPI.post(
        "/payments/create-order",
        {
          courseId,
          couponCode: appliedCoupon || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (orderRes.data?.alreadyEnrolled) {
        toast.info("You are already enrolled in this course.", {
          position: "top-center",
          autoClose: 2500,
          theme: "colored"
        });
        navigate(`/player/${courseId}`);
        return;
      }

      const orderId = orderRes.data?.orderId || orderRes.data?.order?.id;
      const amountPaise = Number(
        orderRes.data?.amountPaise ??
        orderRes.data?.pricing?.payableAmountPaise ??
        orderRes.data?.order?.amount ??
        orderRes.data?.amount ??
        0
      );
      const currency = orderRes.data?.currency || orderRes.data?.order?.currency || "INR";

      if (!orderId || !amountPaise) {
        throw new Error(orderRes.data?.message || "Unable to create Razorpay order");
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountPaise,
        currency,
        name: "Shikshana LMS",
        description: `Payment for ${course.title}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            await studentAPI.post(
              "/payments/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success("Payment successful! Redirecting to course...", {
              position: "top-center",
              autoClose: 3000,
              theme: "colored"
            });
            
            setTimeout(() => navigate(`/player/${courseId}`), 3200);
          } catch (err) {
            console.error("Payment verification error:", err);
            const message =
              err?.response?.data?.message ||
              "Payment verification failed. Please contact support.";
            toast.error(message, {
              position: "top-center",
              autoClose: 5000,
              theme: "colored"
            });
          } finally {
            setIsPaymentOpen(false);
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaymentOpen(false);
            setProcessing(false);
            toast.info("Payment cancelled", {
              position: "top-center",
              autoClose: 2000,
              theme: "colored"
            });
          }
        },
        theme: { color: "#4f46e5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      setIsPaymentOpen(false);
      setProcessing(false);
      
      const message = err?.response?.data?.message || 
                     err?.message || 
                     "Payment failed. Please try again.";
      
      toast.error(message, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored"
      });
    }
  };

  if (loading || !course || !access) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Checkout Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => navigate("/catalog")}
            className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-medium shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  /* ================= PRICE LOGIC ================= */
  const isFree = access.isFree === true;
  const price = Number(access.price || 0);
  const discountAmount = roundCurrency((price * discountPercent) / 100);
  const finalPrice = Math.max(roundCurrency(price - discountAmount), 0);
  const originalPrice = price > 0 ? `₹${price.toLocaleString('en-IN')}` : "Free";
  const formattedFinalPrice = isFree ? "Free" : `₹${finalPrice.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            aria-label="Back to course details"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-800">
              Complete Your Purchase
            </h1>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Course Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Course Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 overflow-hidden shadow-xl">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.thumbnail || "https://placehold.co/600x400/indigo-50/indigo-600?text=Course+Preview"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/600x400/indigo-50/indigo-600?text=Course+Preview";
                  }}
                />
                {isFree && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    100% FREE
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span>{isFree ? "Free Course" : "One-time payment"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    What You'll Get
                  </h3>
                  <ul className="space-y-1.5 text-gray-700">
                    {[
                      "Full lifetime access",
                      "Certificate of completion",
                      "Mobile and TV access",
                      "24/7 Instructor support"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Security Badge */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-indigo-100 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Secure & Guaranteed</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Your payment is protected with 256-bit SSL encryption. 
                    If you're not satisfied within 30 days, get a full refund—no questions asked.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Glassmorphism Payment Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Order Summary
                </h2>
              </div>
              
              <div className="p-6 space-y-5">
                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Course Price</span>
                    <span className="font-medium">{originalPrice}</span>
                  </div>
                  
                  <AnimatePresence>
                    {appliedCoupon && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex justify-between text-emerald-700 bg-emerald-50 p-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Ticket className="w-4 h-4" />
                          <span>Coupon ({appliedCoupon})</span>
                        </div>
                        <span>-Rs {discountAmount.toLocaleString('en-IN')} ({discountPercent}%)</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-lg">Total Payable</span>
                      <motion.div
                        key={finalPrice}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-2xl font-bold ${
                          isFree ? 'text-emerald-600' : 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-700'
                        }`}
                      >
                        {formattedFinalPrice}
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Coupon Section */}
                {!isFree && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-600" />
                      Have a coupon?
                    </label>
                    
                    <AnimatePresence mode="wait">
                      {!appliedCoupon ? (
                        <motion.div
                          key="coupon-input"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-2"
                        >
                          <input
                            ref={couponInputRef}
                            type="text"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                            placeholder="Enter coupon code"
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          />
                          <Button
                            onClick={applyCoupon}
                            disabled={loading || !coupon.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl transition-all disabled:opacity-70"
                          >
                            {loading ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              "Apply"
                            )}
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="coupon-applied"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl"
                        >
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-emerald-800">{appliedCoupon}</span>
                            <span className="text-xs text-emerald-600">({discountPercent}% off)</span>
                          </div>
                          <button
                            onClick={removeCoupon}
                            className="text-rose-600 hover:text-rose-800 font-medium text-sm transition-colors"
                          >
                            Remove
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                
                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={processing || isPaymentOpen}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform ${
                    processing || isPaymentOpen
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : isFree
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                      : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
                  } hover:shadow-xl hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-lg`}
                >
                  {processing ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      {isPaymentOpen ? "Processing Payment..." : "Completing Enrollment..."}
                    </div>
                  ) : isFree ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Enroll for Free
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Pay {formattedFinalPrice} with Razorpay
                    </div>
                  )}
                </Button>
                
                {/* Payment Security Note */}
                <div className="pt-4 border-t border-gray-100 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>100% Secure Payment</span>
                  </div>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Payments processed by Razorpay with bank-level security. 
                    Your financial information is never stored on our servers.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />, label: "Secure Checkout" },
                { icon: <Percent className="w-6 h-6 text-amber-600" />, label: "Money-Back Guarantee" },
                { icon: <CheckCircle className="w-6 h-6 text-indigo-600" />, label: "Instant Access" }
              ].map((badge, index) => (
                <div 
                  key={index} 
                  className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-100"
                >
                  <div className="flex justify-center mb-2">{badge.icon}</div>
                  <p className="text-xs font-medium text-gray-700">{badge.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
