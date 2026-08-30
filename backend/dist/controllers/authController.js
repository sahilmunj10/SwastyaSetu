"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.getCurrentUser = getCurrentUser;
exports.getDemoAccounts = getDemoAccounts;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auditMiddleware_1 = require("../middleware/auditMiddleware");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'swasthya-setu-super-secret-key-2026';
async function login(req, res) {
    try {
        const { email, password, role } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email or Mobile Number is required.' });
        }
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email.toLowerCase() },
                    { phone: email }
                ]
            },
            include: { facility: true }
        });
        // If demo mode and user not found, try matching by role
        if (!user && role) {
            user = await prisma.user.findFirst({
                where: { role: role.toUpperCase() },
                include: { facility: true }
            });
        }
        if (!user) {
            return res.status(401).json({ error: 'Invalid login credentials. Please use demo accounts.' });
        }
        // In demo mode or matching password
        let isPasswordValid = true;
        if (password && user.passwordHash) {
            isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash) || password.includes('123');
        }
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Incorrect password. Try demo password (e.g. asha123, doctor123)' });
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            facilityId: user.facilityId
        }, JWT_SECRET, { expiresIn: '7d' });
        await (0, auditMiddleware_1.logAuditEvent)({
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            action: 'LOGIN',
            entity: 'User',
            entityId: user.id,
            details: `User logged in successfully as ${user.role} role.`
        });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                facilityId: user.facilityId,
                facilityName: user.facility?.name || null,
                facilityType: user.facility?.type || null,
                abhaId: user.abhaId
            }
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login authentication.' });
    }
}
async function getCurrentUser(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { facility: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'User record not found.' });
        }
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                facilityId: user.facilityId,
                facilityName: user.facility?.name || null,
                facilityType: user.facility?.type || null,
                abhaId: user.abhaId
            }
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Error fetching current user.' });
    }
}
async function getDemoAccounts(req, res) {
    try {
        const users = await prisma.user.findMany({
            include: { facility: true },
            orderBy: { role: 'asc' }
        });
        const demoList = users.map(u => ({
            id: u.id,
            role: u.role,
            name: u.name,
            email: u.email,
            facilityName: u.facility?.name || 'Central Portal',
            demoPassword: `${u.role.toLowerCase()}123`
        }));
        res.json({ demoAccounts: demoList });
    }
    catch (err) {
        res.status(500).json({ error: 'Error fetching demo accounts.' });
    }
}
