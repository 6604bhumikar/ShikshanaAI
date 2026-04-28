import { Router } from "express";
import {
  createOrderController,
  downloadInvoicePdf,
  getInvoiceHtml,
  getMyPayments,
  getOrders,
  getPaymentById,
  verifyPaymentController,
} from "../controllers/payment.controller";
import { requireStudent } from "../middleware/role.middleware";

const router = Router();

router.post("/create-order", requireStudent, createOrderController);
router.post("/verify", requireStudent, verifyPaymentController);
router.get("/my-payments", requireStudent, getMyPayments);

router.post("/payments/create-order", requireStudent, createOrderController);
router.post("/payments/verify-payment", requireStudent, verifyPaymentController);

router.get("/orders", requireStudent, getOrders);
router.get("/orders/:id/invoice", requireStudent, getInvoiceHtml);
router.get("/orders/:id/invoice/download", requireStudent, downloadInvoicePdf);

router.get("/:id", requireStudent, getPaymentById);

export default router;
