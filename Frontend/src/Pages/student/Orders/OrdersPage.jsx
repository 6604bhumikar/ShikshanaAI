import React, { useEffect, useState } from "react";
import axios from "axios";
import OrderCard from "./OrderCard";
import { 
  Package, 
  AlertCircle, 
  Loader,
  ShoppingBag,
  FileText
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_STUDENT = 
    import.meta.env.VITE_API_STUDENT || "http://localhost:5000/api/student";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        
        if (!token) {
          setError("Session expired. Please login again.");
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        
        const res = await axios.get(`${API_STUDENT}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Handle different API response structures
        const ordersData = Array.isArray(res.data) 
          ? res.data 
          : res.data?.orders || res.data?.data || [];
          
        setOrders(ordersData);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError(err.response?.data?.message || "Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_STUDENT]);

  // Skeleton Loader Component
  const OrderSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
      <div className="h-1.5 bg-gray-200"></div>
      <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-shrink-0 w-28 h-20 md:w-32 md:h-24 bg-gray-200 rounded-xl"></div>
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="flex-shrink-0 w-24 h-8 bg-gray-200 rounded"></div>
      </div>
      <div className="px-5 md:px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="h-8 bg-gray-200 rounded w-40 ml-auto"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <ShoppingBag className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            My Orders
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mt-2">
            View your course purchases, download invoices, and track payment status
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          // Skeleton Loaders
          <div className="space-y-5">
            {[...Array(3)].map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-50 mb-4">
              <Package className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              You haven't purchased any courses yet. Browse our course catalog to start your learning journey!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Go Back
              </button>
              <a
                href="/catalog"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg font-medium"
              >
                Browse Courses
              </a>
            </div>
          </div>
        ) : (
          // Orders List
          <div className="space-y-5">
            {orders.map((order) => (
              <OrderCard key={order._id || order.id} order={order} />
            ))}
            
            {/* Summary Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 mt-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2.5 rounded-xl">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Order Summary</h3>
                    <p className="text-sm text-gray-600">
                      {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                      ₹{orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Paid Orders</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {orders.filter(o => o.status === 'paid').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
