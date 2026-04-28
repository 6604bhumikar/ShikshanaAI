"use strict";
// import app from "./app";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`API Gateway running on port ${PORT}`);
// });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // LOAD ENV FIRST
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 5000;
app_1.default.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
