import React, { useEffect, useState } from "react";
import adminAPI from "../../lib/adminApi";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  IndianRupee,
  CheckCircle2,
  XCircle,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ======================
     FORMAT RUPEES
  ====================== */
  const formatRupees = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  /* ======================
     LOAD PAYOUTS
  ====================== */
  useEffect(() => {
    const loadPayouts = async () => {
      try {
        const res = await adminAPI.get("/payouts");
        setPayouts(res.data.payouts || []);
      } catch (error) {
        console.error("Failed to load payouts", error);
      } finally {
        setLoading(false);
      }
    };

    loadPayouts();
  }, []);

  /* ======================
     UPDATE PAYOUT STATUS
  ====================== */
  const handleAction = async (id, status) => {
    try {
      await adminAPI.patch(`/payouts/${id}`, { status });

      setPayouts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, status } : p
        )
      );
    } catch (error) {
      console.error("Payout update failed", error);
      alert("Failed to update payout");
    }
  };

  /* ======================
     SUMMARY
  ====================== */
  const totalEarnings = payouts.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  const pendingCount = payouts.filter(
    (p) => p.status === "pending"
  ).length;

  const paidCount = payouts.filter(
    (p) => p.status === "paid"
  ).length;

  if (loading) {
    return (
      <div className="p-10 text-gray-600">
        Loading payouts...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-indigo-800 mb-2">
              💳 Payouts & Finance
            </h1>
            <p className="text-gray-600">
              Manage teacher earnings and payout history.
            </p>
          </div>
          <Button className="bg-indigo-600 text-white mt-4 md:mt-0">
            Export Report
          </Button>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex justify-between">
              <CardTitle className="text-sm text-gray-600">
                Total Earnings
              </CardTitle>
              <Wallet className="text-indigo-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatRupees(totalEarnings)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between">
              <CardTitle className="text-sm text-gray-600">
                Pending Payouts
              </CardTitle>
              <Clock className="text-yellow-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between">
              <CardTitle className="text-sm text-gray-600">
                Paid Payouts
              </CardTitle>
              <CheckCircle2 className="text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{paidCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* PAYOUT TABLE */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee /> Payout Requests
            </CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-600">
                  <th className="py-3 px-4">Teacher</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {payouts.map((p) => (
                  <tr key={p._id} className="border-b">
                    <td className="py-3 px-4 font-medium">
                      {p.teacher?.name ||
                        p.teacher?.fullName ||
                        "Instructor"}
                    </td>

                    <td className="py-3 px-4 font-semibold">
                      {formatRupees(p.amount)}
                    </td>

                    <td className="py-3 px-4">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        className={
                          p.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : p.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {p.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 flex justify-end gap-2">
                      {p.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 text-white"
                            onClick={() =>
                              handleAction(p._id, "paid")
                            }
                          >
                            <ArrowUpRight className="w-4 h-4" />
                            Pay
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() =>
                              handleAction(p._id, "on-hold")
                            }
                          >
                            <XCircle className="w-4 h-4" />
                            Hold
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" disabled variant="outline">
                          <ArrowDownRight className="w-4 h-4" />
                          Processed
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* EMPTY */}
        {payouts.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <Wallet className="w-10 h-10 mx-auto mb-3 text-indigo-400" />
            <p>No payout requests available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
