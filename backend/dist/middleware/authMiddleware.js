"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'swasthya-setu-super-secret-key-2026';
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    const demoRole = req.headers['x-demo-role'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = decoded;
            return next();
        }
        catch (err) {
            // If token expired/invalid, try demo role fallback
        }
    }
    // Fallback for demo role switcher convenience
    if (demoRole) {
        prisma.user.findFirst({ where: { role: demoRole.toUpperCase() } })
            .then(user => {
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    facilityId: user.facilityId
                };
            }
            next();
        })
            .catch(() => next());
        return;
    }
    // Default anonymous public pass-through (controllers can check req.user where necessary)
    next();
}
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }
    next();
}
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]` });
        }
        next();
    };
}
