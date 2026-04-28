import mongoose, { Schema } from "mongoose";

const externalConnections = new Map<string, mongoose.Connection>();

const getExternalConnection = (uri: string) => {
  const existing = externalConnections.get(uri);
  if (existing) return existing;

  const connection = mongoose.createConnection(uri);
  externalConnections.set(uri, connection);
  return connection;
};

const authConnection = getExternalConnection(
  process.env.AUTH_MONGO_URI || "mongodb://localhost:27017/auth-db"
);
const contentConnection = getExternalConnection(
  process.env.CONTENT_MONGO_URI || "mongodb://localhost:27017/content-db"
);
const paymentConnection = getExternalConnection(
  process.env.PAYMENT_MONGO_URI || "mongodb://localhost:27017/payment-db"
);

const UserSchema = new Schema(
  {
    name: String,
    email: String,
    role: String,
    isBlocked: Boolean,
  },
  { timestamps: true, strict: false }
);

const CourseSchema = new Schema(
  {
    teacherId: Schema.Types.Mixed,
    title: String,
    description: String,
    category: String,
    language: String,
    price: Number,
    isFree: Boolean,
    status: String,
    units: [Schema.Types.Mixed],
  },
  { timestamps: true, strict: false }
);

const PaymentSchema = new Schema(
  {
    studentId: String,
    courseId: String,
    amount: Number,
    status: String,
  },
  { timestamps: true, strict: false }
);

export const ExternalUser =
  authConnection.models.User || authConnection.model("User", UserSchema);

export const ExternalCourse =
  contentConnection.models.Course || contentConnection.model("Course", CourseSchema);

export const ExternalPayment =
  paymentConnection.models.Payment || paymentConnection.model("Payment", PaymentSchema);
