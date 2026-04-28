"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogs = exports.createLog = void 0;
const log_model_1 = require("../models/log.model");
const createLog = async (req, res) => {
    const log = await log_model_1.Log.create(req.body);
    res.status(201).json({ success: true, log });
};
exports.createLog = createLog;
const getLogs = async (req, res) => {
    const { service, level } = req.query;
    const filter = {};
    if (service)
        filter.service = service;
    if (level)
        filter.level = level;
    const logs = await log_model_1.Log.find(filter).sort({ timestamp: -1 }).limit(200);
    res.json({ success: true, logs });
};
exports.getLogs = getLogs;
