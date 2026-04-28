import mongoose from "mongoose";
import {
  createOrder,
  getInvoiceHtmlService,
  getInvoicePdfService,
  getMyPaymentsService,
  getPaymentByIdService,
  verifyPayment,
} from "../services/payment.service";

export const createOrderController = async (req: any, res: any) => {
  try {
    const studentId = req.headers["x-user-id"];
    const { courseId, couponCode } = req.body;
    console.log("[payment] Create order request", { studentId, courseId, couponCode });

    const result = await createOrder(studentId, courseId, couponCode);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyPaymentController = async (req: any, res: any) => {
  try {
    const studentId = req.headers["x-user-id"];
    const {
      courseId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    console.log("[payment] Verify payment request", {
      studentId,
      courseId,
      razorpay_order_id,
      razorpay_payment_id,
    });

    const result = await verifyPayment(
      studentId,
      courseId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    res.json({
      success: true,
      message: "Payment verified and enrollment completed",
      ...result,
      enrolled: true,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyPayments = async (req: any, res: any) => {
  try {
    const studentId = req.headers["x-user-id"];
    const payments = await getMyPaymentsService(studentId);
    res.json({ success: true, payments });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getOrders = async (req: any, res: any) => {
  try {
    const studentId = req.headers["x-user-id"];
    const orders = await getMyPaymentsService(studentId);
    res.json({ orders });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getPaymentById = async (req: any, res: any) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid payment ID" });
    }

    const payment = await getPaymentByIdService(
      req.params.id,
      req.headers["x-user-id"]
    );

    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const getInvoiceHtml = async (req: any, res: any) => {
  try {
    const html = await getInvoiceHtmlService(req.params.id, req.headers["x-user-id"]);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const downloadInvoicePdf = async (req: any, res: any) => {
  try {
    const buffer = await getInvoicePdfService(req.params.id, req.headers["x-user-id"]);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Invoice_${req.params.id}.pdf"`
    );
    res.send(buffer);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};
