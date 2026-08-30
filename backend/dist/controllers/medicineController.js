"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMedicines = getMedicines;
exports.searchMedicineAcrossFacilities = searchMedicineAcrossFacilities;
exports.updateMedicineStock = updateMedicineStock;
const client_1 = require("@prisma/client");
const auditMiddleware_1 = require("../middleware/auditMiddleware");
const prisma = new client_1.PrismaClient();
async function getMedicines(req, res) {
    try {
        const { facilityId, category, search, lowStockOnly } = req.query;
        const where = {};
        if (facilityId)
            where.facilityId = String(facilityId);
        if (category)
            where.category = String(category);
        if (search) {
            const q = String(search);
            where.OR = [
                { name: { contains: q } },
                { genericName: { contains: q } }
            ];
        }
        const medicines = await prisma.medicine.findMany({
            where,
            include: { facility: true },
            orderBy: { name: 'asc' }
        });
        const enriched = medicines.map(m => {
            let stockStatus = 'AVAILABLE';
            if (m.quantity === 0)
                stockStatus = 'OUT_OF_STOCK';
            else if (m.quantity <= m.reorderThreshold)
                stockStatus = 'LOW_STOCK';
            return {
                ...m,
                stockStatus,
                isLowStock: m.quantity <= m.reorderThreshold
            };
        });
        const filtered = lowStockOnly === 'true'
            ? enriched.filter(m => m.isLowStock)
            : enriched;
        res.json({
            medicines: filtered,
            totalCount: filtered.length,
            lowStockCount: enriched.filter(m => m.isLowStock).length
        });
    }
    catch (err) {
        console.error('Get medicines error:', err);
        res.status(500).json({ error: 'Failed to fetch medicines inventory.' });
    }
}
async function searchMedicineAcrossFacilities(req, res) {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required.' });
        }
        const q = String(query).toLowerCase();
        const medicines = await prisma.medicine.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { genericName: { contains: q } },
                    { category: { contains: q } }
                ]
            },
            include: { facility: true }
        });
        // Approximate distance map for demo relative to Kalyan central
        const distances = {
            'Primary Health Centre (PHC) Kalyan Rural': '1.2 km (Current / Nearest)',
            'Sub-District Rural Hospital Dombivli': '8.5 km (Approx 20 mins)',
            'Thane District Civil Hospital': '22.0 km (Approx 45 mins)',
            'PHC Shahapur Tribal Belt': '32.0 km (Approx 60 mins)',
            'Rural Sub-District Hospital Bhiwandi': '14.0 km (Approx 30 mins)'
        };
        const results = medicines.map(m => {
            let status = 'AVAILABLE';
            let statusColor = 'green';
            if (m.quantity === 0) {
                status = 'OUT_OF_STOCK';
                statusColor = 'red';
            }
            else if (m.quantity <= m.reorderThreshold) {
                status = 'LOW_STOCK';
                statusColor = 'yellow';
            }
            return {
                medicineId: m.id,
                name: m.name,
                genericName: m.genericName,
                strength: m.strength,
                dosageForm: m.dosageForm,
                quantity: m.quantity,
                facilityName: m.facility.name,
                facilityType: m.facility.type,
                facilityAddress: m.facility.address,
                facilityPhone: m.facility.contactPhone,
                estimatedDistance: distances[m.facility.name] || '10.0 km',
                stockStatus: status,
                statusColor,
                expiryDate: m.expiryDate
            };
        });
        res.json({
            query: q,
            resultsCount: results.length,
            facilitiesWithStock: results
        });
    }
    catch (err) {
        console.error('Search medicine error:', err);
        res.status(500).json({ error: 'Failed to search medicine across facilities.' });
    }
}
async function updateMedicineStock(req, res) {
    try {
        const { id } = req.params;
        const { quantity, reorderThreshold, isAvailable } = req.body;
        const existing = await prisma.medicine.findUnique({
            where: { id },
            include: { facility: true }
        });
        if (!existing) {
            return res.status(404).json({ error: 'Medicine not found.' });
        }
        const newQty = quantity !== undefined ? Number(quantity) : existing.quantity;
        const updated = await prisma.medicine.update({
            where: { id },
            data: {
                quantity: newQty,
                reorderThreshold: reorderThreshold !== undefined ? Number(reorderThreshold) : existing.reorderThreshold,
                isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : newQty > 0,
                lastRestockedAt: new Date()
            },
            include: { facility: true }
        });
        await (0, auditMiddleware_1.logAuditEvent)({
            userId: req.user?.id,
            userName: req.user?.name || 'Pharmacist',
            userRole: req.user?.role || 'PHARMACY',
            action: 'UPDATE_MEDICINE_STOCK',
            entity: 'Medicine',
            entityId: updated.id,
            details: `Updated stock of ${updated.name} at ${updated.facility.name} to ${updated.quantity} units.`
        });
        res.json({ medicine: updated, message: 'Stock updated successfully.' });
    }
    catch (err) {
        console.error('Update medicine error:', err);
        res.status(500).json({ error: 'Failed to update medicine stock.' });
    }
}
