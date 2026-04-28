"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const app = (0, express_1.default)();
/* ================= SECURITY ================= */
app.use((0, helmet_1.default)());
/* ================= CORS ================= */
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
/* ================= BODY PARSER ================= */
app.use(express_1.default.json());
/* ================= ROUTES ================= */
//app.use("/", routes);
//app.use("/api/auth", routes);
app.use("/", auth_routes_1.default);
/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
    res.send("Auth Service Running");
});
exports.default = app;
