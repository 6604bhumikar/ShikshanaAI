"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalPayment = exports.ExternalCourse = exports.ExternalUser = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const externalConnections = new Map();
const getExternalConnection = (uri) => {
    const existing = externalConnections.get(uri);
    if (existing)
        return existing;
    const connection = mongoose_1.default.createConnection(uri);
    externalConnections.set(uri, connection);
    return connection;
};
const authConnection = getExternalConnection(process.env.AUTH_MONGO_URI || "mongodb://localhost:27017/auth-db");
const contentConnection = getExternalConnection(process.env.CONTENT_MONGO_URI || "mongodb://localhost:27017/content-db");
const paymentConnection = getExternalConnection(process.env.PAYMENT_MONGO_URI || "mongodb://localhost:27017/payment-db");
const UserSchema = new mongoose_1.Schema({
    name: String,
    email: String,
    role: String,
    isBlocked: Boolean,
}, { timestamps: true, strict: false });
const CourseSchema = new mongoose_1.Schema({
    teacherId: mongoose_1.Schema.Types.Mixed,
    title: String,
    description: String,
    category: String,
    language: String,
    price: Number,
    isFree: Boolean,
    status: String,
    units: [mongoose_1.Schema.Types.Mixed],
}, { timestamps: true, strict: false });
const PaymentSchema = new mongoose_1.Schema({
    studentId: String,
    courseId: String,
    amount: Number,
    status: String,
}, { timestamps: true, strict: false });
exports.ExternalUser = authConnection.models.User || authConnection.model("User", UserSchema);
exports.ExternalCourse = contentConnection.models.Course || contentConnection.model("Course", CourseSchema);
exports.ExternalPayment = paymentConnection.models.Payment || paymentConnection.model("Payment", PaymentSchema);
