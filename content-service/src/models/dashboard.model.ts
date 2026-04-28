import mongoose, { Schema } from "mongoose";

const externalConnections = new Map<string, mongoose.Connection>();

const getExternalConnection = (uri: string) => {
  const existing = externalConnections.get(uri);
  if (existing) return existing;

  const connection = mongoose.createConnection(uri);
  externalConnections.set(uri, connection);
  return connection;
};

const enrollmentConnection = getExternalConnection(
  process.env.ENROLLMENT_MONGO_URI || "mongodb://localhost:27017/enrollment-db"
);

const paymentConnection = getExternalConnection(
  process.env.PAYMENT_MONGO_URI || "mongodb://localhost:27017/payment-db"
);

const EnrollmentSchema = new Schema(
  {
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    completedLessons: { type: [String], default: [] },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true, strict: false }
);

const PaymentSchema = new Schema(
  {
    studentId: { type: String, required: true },
    courseId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "created" },
  },
  { timestamps: true, strict: false }
);

export const Enrollment =
  enrollmentConnection.models.Enrollment ||
  enrollmentConnection.model("Enrollment", EnrollmentSchema);

export const Payment =
  paymentConnection.models.Payment ||
  paymentConnection.model("Payment", PaymentSchema);
