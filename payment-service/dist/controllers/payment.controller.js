"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadInvoicePdf = exports.getInvoiceHtml = exports.getPaymentById = exports.getOrders = exports.getMyPayments = exports.verifyPaymentController = exports.createOrderController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const payment_service_1 = require("../services/payment.service");
const createOrderController = async (req, res) => {
    try {
        const studentId = req.headers["x-user-id"];
        const { courseId, couponCode } = req.body;
        console.log("[payment] Create order request", { studentId, courseId, couponCode });
        const result = await (0, payment_service_1.createOrder)(studentId, courseId, couponCode);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createOrderController = createOrderController;
const verifyPaymentController = async (req, res) => {
    try {
        const studentId = req.headers["x-user-id"];
        const { courseId, razorpay_order_id, razorpay_payment_id, razorpay_signature, } = req.body;
        console.log("[payment] Verify payment request", {
            studentId,
            courseId,
            razorpay_order_id,
            razorpay_payment_id,
        });
        const result = await (0, payment_service_1.verifyPayment)(studentId, courseId, razorpay_order_id, razorpay_payment_id, razorpay_signature);
        res.json({
            success: true,
            message: "Payment verified and enrollment completed",
            ...result,
            enrolled: true,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.verifyPaymentController = verifyPaymentController;
const getMyPayments = async (req, res) => {
    try {
        const studentId = req.headers["x-user-id"];
        const payments = await (0, payment_service_1.getMyPaymentsService)(studentId);
        res.json({ success: true, payments });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getMyPayments = getMyPayments;
const getOrders = async (req, res) => {
    try {
        const studentId = req.headers["x-user-id"];
        const orders = await (0, payment_service_1.getMyPaymentsService)(studentId);
        res.json({ orders });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.getOrders = getOrders;
const getPaymentById = async (req, res) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid payment ID" });
        }
        const payment = await (0, payment_service_1.getPaymentByIdService)(req.params.id, req.headers["x-user-id"]);
        res.json({ success: true, payment });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getPaymentById = getPaymentById;
const getInvoiceHtml = async (req, res) => {
    try {
        const html = await (0, payment_service_1.getInvoiceHtmlService)(req.params.id, req.headers["x-user-id"]);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(html);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.getInvoiceHtml = getInvoiceHtml;
const downloadInvoicePdf = async (req, res) => {
    try {
        const buffer = await (0, payment_service_1.getInvoicePdfService)(req.params.id, req.headers["x-user-id"]);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="Invoice_${req.params.id}.pdf"`);
        res.send(buffer);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.downloadInvoicePdf = downloadInvoicePdf;
