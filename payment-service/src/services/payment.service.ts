import crypto from "crypto";
import axios from "axios";
import { razorpay } from "../config/razorpay";
import { Payment } from "../models/payment.model";
import { ExternalCourse } from "../models/external.model";

const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || "http://localhost:5002";
const ENROLLMENT_SERVICE_URL = process.env.ENROLLMENT_SERVICE_URL || "http://localhost:5004";

const escapePdfText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const buildSimplePdfBuffer = (lines: string[]) => {
  const content = `BT /F1 18 Tf 50 760 Td ${lines
    .map((line, index) =>
      `${index === 0 ? "" : "T* "}(${escapePdfText(line)}) Tj`
    )
    .join(" ")} ET`;

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${Buffer.byteLength(content, "utf8")} >> stream\n${content}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${object}\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
};

const invoiceNumberFor = (paymentId: string) =>
  `INV-${paymentId.slice(-8).toUpperCase()}`;

const normalizeAmount = (value: unknown) => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const toPaise = (value: number) => Math.round(roundCurrency(value) * 100);

const buildCourseResponse = (course: any) =>
  course
    ? {
        _id: course._id,
        title: course.title || "Course purchase",
        price: normalizeAmount(course.price),
        isFree: Boolean(course.isFree),
        thumbnail: course.thumbnail || "",
      }
    : null;

const getPublishedCourse = async (courseId: string) => {
  const response = await axios.get(`${CONTENT_SERVICE_URL}/internal/courses/${courseId}`);
  const course = response.data?.course;

  if (!response.data?.success || !course) {
    throw new Error("Course not found");
  }

  if (course.status !== "published") {
    throw new Error("Course is not available for purchase");
  }

  return course;
};

const getExistingSuccessPayment = async (studentId: string, courseId: string) =>
  Payment.findOne({
    studentId,
    courseId,
    status: "success",
  }).sort({ createdAt: -1 });

const checkEnrollmentStatus = async (studentId: string, courseId: string) => {
  const response = await axios.get(
    `${ENROLLMENT_SERVICE_URL}/internal/check/${courseId}`,
    {
      headers: {
        "x-user-id": studentId,
      },
    }
  );

  return Boolean(response.data?.enrolled);
};

const validateCouponDiscount = async (courseId: string, couponCode?: string) => {
  const normalizedCode = String(couponCode || "").trim().toUpperCase();
  if (!normalizedCode) {
    return null;
  }

  const response = await axios.post(`${CONTENT_SERVICE_URL}/coupons/validate`, {
    code: normalizedCode,
    courseId,
  });

  if (!response.data?.valid) {
    throw new Error("Invalid or expired coupon");
  }

  return {
    code: String(response.data.code || normalizedCode),
    discountPercent: normalizeAmount(response.data.discountPercent),
  };
};

const resolvePurchaseAmount = async (courseId: string, couponCode?: string) => {
  const course = await getPublishedCourse(courseId);
  const coursePrice = normalizeAmount(course.price);

  if (Boolean(course.isFree) || coursePrice <= 0) {
    return {
      course,
      coupon: null,
      coursePrice: 0,
      payableAmount: 0,
      payableAmountPaise: 0,
    };
  }

  const coupon = await validateCouponDiscount(courseId, couponCode);
  const discountPercent = coupon ? Math.min(Math.max(coupon.discountPercent, 0), 100) : 0;
  const discountAmount = roundCurrency((coursePrice * discountPercent) / 100);
  const payableAmount = Math.max(roundCurrency(coursePrice - discountAmount), 0);
  console.log("[payment] Resolved course price", {
    courseId,
    coursePrice,
    discountPercent,
    payableAmount,
    payableAmountPaise: toPaise(payableAmount),
  });

  return {
    course,
    coupon,
    coursePrice,
    discountPercent,
    discountAmount,
    payableAmount,
    payableAmountPaise: toPaise(payableAmount),
  };
};

const enrollStudentAfterPurchase = async (studentId: string, courseId: string) => {
  const response = await axios.post(
    `${ENROLLMENT_SERVICE_URL}/enroll`,
    { courseId },
    {
      headers: {
        "x-user-id": studentId,
        "x-user-role": "student",
      },
    }
  );

  return {
    enrollment: response.data?.enrollment || null,
    alreadyEnrolled: Boolean(response.data?.alreadyEnrolled),
  };
};

const buildInvoicePdf = (payment: any) =>
  buildSimplePdfBuffer([
    "Shikshana LMS Invoice",
    "",
    `Invoice: ${payment.invoiceNumber}`,
    `Course: ${payment.course?.title || "Course purchase"}`,
    `Amount: INR ${Number(payment.amount || 0).toLocaleString("en-IN")}`,
    `Status: ${payment.status}`,
    `Date: ${new Date(payment.createdAt).toLocaleDateString("en-IN")}`,
  ]);

export const createOrder = async (
  studentId: string,
  courseId: string,
  couponCode?: string
) => {
  if (!studentId) {
    throw new Error("Student authentication required");
  }

  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const existingSuccessPayment = await getExistingSuccessPayment(studentId, courseId);
  const isAlreadyEnrolled = await checkEnrollmentStatus(studentId, courseId);

  if (existingSuccessPayment || isAlreadyEnrolled) {
    const existingCourse =
      existingSuccessPayment?.courseId === courseId
        ? await getPublishedCourse(courseId)
        : await getPublishedCourse(courseId);

    return {
      success: true,
      alreadyEnrolled: true,
      message: "You are already enrolled in this course",
      course: buildCourseResponse(existingCourse),
      payment: existingSuccessPayment,
    };
  }

  const { course, coupon, coursePrice, discountPercent, discountAmount, payableAmount, payableAmountPaise } =
    await resolvePurchaseAmount(courseId, couponCode);

  if (payableAmount <= 0) {
    const { enrollment, alreadyEnrolled } = await enrollStudentAfterPurchase(studentId, courseId);
    const payment = await Payment.create({
      studentId,
      courseId,
      amount: 0,
      currency: "INR",
      coursePrice,
      couponCode: coupon?.code || null,
      discountPercent,
      discountAmount,
      status: "success",
      razorpayOrderId: `FREE-${Date.now()}`,
      razorpayPaymentId: `FREE-${Date.now()}`,
    });

    return {
      success: true,
      message: alreadyEnrolled
        ? "You are already enrolled in this course"
        : "Course enrolled successfully",
      alreadyEnrolled,
      enrolled: true,
      course: buildCourseResponse(course),
      pricing: {
        coursePrice,
        payableAmount,
        payableAmountPaise: 0,
        amountRupees: 0,
        amountPaise: 0,
        currency: "INR",
        couponCode: coupon?.code || null,
        discountPercent,
        discountAmount,
      },
      order: {
        id: payment.razorpayOrderId,
        amount: 0,
        currency: "INR",
        status: "paid",
      },
      orderId: payment.razorpayOrderId,
      amount: 0,
      amountRupees: 0,
      amountPaise: 0,
      currency: "INR",
      payment,
      enrollment,
    };
  }

  const order = await razorpay.orders.create({
    amount: payableAmountPaise,
    currency: "INR",
    receipt: `rcpt_${Date.now()}_${courseId.slice(-8)}`,
    notes: {
      studentId,
      courseId,
    },
  });

  const payment = await Payment.create({
    studentId,
    courseId,
    razorpayOrderId: order.id,
    amount: payableAmount,
    currency: "INR",
    coursePrice,
    couponCode: coupon?.code || null,
    discountPercent,
    discountAmount,
    status: "created",
  });

  console.log("[payment] Razorpay order created", {
    studentId,
    courseId,
    razorpayOrderId: order.id,
    amountRupees: payableAmount,
    amountPaise: payableAmountPaise,
  });

  return {
    success: true,
    alreadyEnrolled: false,
    message: "Order created successfully",
    course: buildCourseResponse(course),
    pricing: {
      coursePrice,
      payableAmount,
      payableAmountPaise,
      currency: "INR",
      couponCode: coupon?.code || null,
      discountPercent,
      discountAmount,
    },
    order,
    orderId: order.id,
    amount: order.amount,
    amountRupees: payableAmount,
    amountPaise: payableAmountPaise,
    currency: order.currency,
    payment,
  };
};

export const verifyPayment = async (
  studentId: string,
  courseId: string,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) => {
  if (!studentId) {
    throw new Error("Student authentication required");
  }

  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
    studentId,
    courseId,
  });
  if (!payment) {
    throw new Error("Payment record not found");
  }

  if (payment.status === "success") {
    const { enrollment, alreadyEnrolled } = await enrollStudentAfterPurchase(studentId, courseId);
    return {
      payment,
      enrollment,
      alreadyEnrolled,
    };
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    payment.status = "failed";
    await payment.save();
    console.error("[payment] Invalid Razorpay signature", {
      studentId,
      courseId,
      razorpayOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
    throw new Error("Invalid payment signature");
  }

  const razorpayPayment = (await razorpay.payments.fetch(razorpay_payment_id)) as any;
  const expectedAmountPaise = toPaise(Number(payment.amount || 0));

  if (
    razorpayPayment.order_id !== razorpay_order_id ||
    Number(razorpayPayment.amount || 0) !== expectedAmountPaise ||
    !["authorized", "captured"].includes(String(razorpayPayment.status))
  ) {
    payment.status = "failed";
    await payment.save();
    console.error("[payment] Razorpay payment details mismatch", {
      studentId,
      courseId,
      razorpayOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      expectedAmountPaise,
      actualAmountPaise: razorpayPayment.amount,
      status: razorpayPayment.status,
    });
    throw new Error("Payment verification failed");
  }

  const { enrollment, alreadyEnrolled } = await enrollStudentAfterPurchase(studentId, courseId);
  payment.status = "success";
  payment.razorpayPaymentId = razorpay_payment_id;
  await payment.save();
  console.log("[payment] Payment verified and enrollment completed", {
    studentId,
    courseId,
    razorpayOrderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    alreadyEnrolled,
  });

  return {
    payment,
    enrollment,
    alreadyEnrolled,
  };
};

export const getMyPaymentsService = async (studentId: string) => {
  const payments = await Payment.find({
    studentId,
    status: { $in: ["success", "paid"] },
  })
    .sort({ createdAt: -1 })
    .lean();

  const courseIds = payments.map((payment: any) => payment.courseId);
  const courses = courseIds.length
    ? await ExternalCourse.find({ _id: { $in: courseIds } }).lean()
    : [];
  const courseMap = new Map(courses.map((course: any) => [String(course._id), course]));

  return payments.map((payment: any) => ({
    ...payment,
    status: payment.status === "success" ? "paid" : payment.status,
    invoiceNumber: invoiceNumberFor(String(payment._id)),
    paymentMethod: Number(payment.amount || 0) > 0 ? "online" : "free",
    course: courseMap.get(String(payment.courseId))
      ? {
          _id: courseMap.get(String(payment.courseId))._id,
          title: courseMap.get(String(payment.courseId)).title,
          thumbnail: courseMap.get(String(payment.courseId)).thumbnail || "",
        }
      : null,
  }));
};

export const getPaymentByIdService = async (paymentId: string, studentId?: string) => {
  const payment = (await Payment.findOne({
    _id: paymentId,
    ...(studentId ? { studentId } : {}),
  }).lean()) as any;

  if (!payment) {
    throw new Error("Payment not found");
  }

  const course = (await ExternalCourse.findById(payment.courseId).lean()) as any;
  return {
    ...payment,
    status: payment.status === "success" ? "paid" : payment.status,
    invoiceNumber: invoiceNumberFor(String(payment._id)),
    paymentMethod: Number(payment.amount || 0) > 0 ? "online" : "free",
    course: course
      ? {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail || "",
        }
      : null,
  };
};

export const getInvoiceHtmlService = async (paymentId: string, studentId: string) => {
  const payment = await getPaymentByIdService(paymentId, studentId);

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Invoice ${payment.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; }
        .header { display:flex; justify-content:space-between; margin-bottom:24px; }
        .card { border:1px solid #e5e7eb; border-radius:16px; padding:24px; }
        .row { display:flex; justify-content:space-between; margin:12px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div><h1>Invoice</h1><div>Shikshana LMS</div></div>
        <div><strong>${payment.invoiceNumber}</strong><div>${new Date(payment.createdAt).toLocaleDateString("en-IN")}</div></div>
      </div>
      <div class="card">
        <div class="row"><span>Course</span><strong>${payment.course?.title || "Course purchase"}</strong></div>
        <div class="row"><span>Status</span><strong>${payment.status}</strong></div>
        <div class="row"><span>Method</span><strong>${payment.paymentMethod}</strong></div>
        <div class="row"><span>Total</span><strong>INR ${Number(payment.amount || 0).toLocaleString("en-IN")}</strong></div>
      </div>
    </body>
  </html>`;
};

export const getInvoicePdfService = async (paymentId: string, studentId: string) => {
  const payment = await getPaymentByIdService(paymentId, studentId);
  return buildInvoicePdf(payment);
};
