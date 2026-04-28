"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
/* ================= PORT ================= */
const PORT = process.env.PORT || 5001;
/* ================= DATABASE ================= */
(0, db_1.connectDB)();
/* ================= START SERVER ================= */
app_1.default.listen(PORT, () => {
    console.log(`Auth Service running on port ${PORT}`);
});
