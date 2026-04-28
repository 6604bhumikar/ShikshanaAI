"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRequestId = void 0;
const uuid_1 = require("uuid");
const assignRequestId = (req, res, next) => {
    const requestId = (0, uuid_1.v4)();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    next();
};
exports.assignRequestId = assignRequestId;
