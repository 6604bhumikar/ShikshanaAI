"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const media_routes_1 = __importDefault(require("./routes/media.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "100mb" }));
app.use("/api/media", media_routes_1.default);
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(() => console.log("Media DB connected"))
    .catch(err => console.error("DB error", err));
app.listen(process.env.PORT, () => {
    console.log(`Media Service running on port ${process.env.PORT}`);
});
