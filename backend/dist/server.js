"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const api_1 = __importDefault(require("./routes/api"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-role']
}));
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Swasthya Setu Public Healthcare API',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        mode: 'SIH Prototype 2026 - Government of Maharashtra'
    });
});
// Mount API routes
app.use('/api', api_1.default);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error occurred in healthcare gateway.'
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏥 SWASTHYA SETU API Server`);
    console.log(`🚀 Running at: http://localhost:${PORT}`);
    console.log(`🩺 Healthcheck: http://localhost:${PORT}/health`);
    console.log(`🌐 Base API: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
});
