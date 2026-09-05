import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAuditEvent } from '../middleware/auditMiddleware';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'swasthya-setu-super-secret-key-2026';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, phone, password, role, facilityId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { phone: phone ? phone.trim() : undefined }
        ].filter(Boolean) as any
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'An account with this email or mobile number already exists. Please log in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate ABDM Health ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const randomMiddle = Math.floor(1000 + Math.random() * 9000);
    const abhaId = `91-${randomMiddle}-${randomSuffix}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Default facility assignment if none specified
    let effectiveFacilityId = facilityId;
    if (!effectiveFacilityId) {
      const defaultFac = await prisma.facility.findFirst();
      effectiveFacilityId = defaultFac?.id || null;
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: role.toUpperCase(),
        facilityId: effectiveFacilityId,
        abhaId
      },
      include: { facility: true }
    });

    // If registered as a patient, also create patient longitudinal record in database
    if (newUser.role === 'PATIENT') {
      const patientCount = await prisma.patient.count();
      const patientId = `MH-THN-${String(10000 + patientCount + 1).padStart(5, '0')}`;
      
      await prisma.patient.create({
        data: {
          patientId,
          name: newUser.name,
          age: 28,
          gender: 'Female',
          phone: newUser.phone || '9820000000',
          village: 'Kalyan Rural',
          address: 'Thane District, Maharashtra',
          emergencyContact: newUser.phone || 'Self',
          facilityId: effectiveFacilityId
        }
      });
    }

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        facilityId: newUser.facilityId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAuditEvent({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'USER_REGISTER',
      entity: 'User',
      entityId: newUser.id,
      details: `New real user account registered as ${newUser.role}. Assigned ABHA ID: ${newUser.abhaId}`
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        facilityId: newUser.facilityId,
        facilityName: newUser.facility?.name || null,
        facilityType: newUser.facility?.type || null,
        abhaId: newUser.abhaId
      },
      message: 'Account created successfully!'
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during user registration.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email or Mobile Number is required.' });
    }

    const normalizedInput = email.toLowerCase().trim();

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedInput },
          { phone: normalizedInput }
        ]
      },
      include: { facility: true }
    });

    // If demo mode switch by role
    if (!user && role) {
      user = await prisma.user.findFirst({
        where: { role: role.toUpperCase() },
        include: { facility: true }
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'No account found with this email/phone. Please Sign Up.' });
    }

    // Verify password with bcrypt or demo fallback
    let isPasswordValid = false;
    if (password && user.passwordHash) {
      isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        // Accept designated demo passwords for ease of SIH demonstration
        const expectedRolePass = `${user.role.toLowerCase()}123`;
        const altOfficerPass = 'officer123';
        if (password === expectedRolePass || password === altOfficerPass || password === 'demo123' || password === 'password123') {
          isPasswordValid = true;
        }
      }
    } else if (!password && (role || user.email.includes('demo'))) {
      // 1-click testing switch accounts (when password field is omitted)
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        facilityId: user.facilityId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAuditEvent({
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
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login authentication.' });
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
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
  } catch (err: any) {
    res.status(500).json({ error: 'Error fetching current user profile.' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    const { name, phone, facilityId } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name ? name.trim() : undefined,
        phone: phone ? phone.trim() : undefined,
        facilityId: facilityId || undefined
      },
      include: { facility: true }
    });

    await logAuditEvent({
      userId: updated.id,
      userName: updated.name,
      userRole: updated.role,
      action: 'UPDATE_PROFILE',
      entity: 'User',
      entityId: updated.id,
      details: `Updated personal profile information.`
    });

    res.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        facilityId: updated.facilityId,
        facilityName: updated.facility?.name || null,
        facilityType: updated.facility?.type || null,
        abhaId: updated.abhaId
      },
      message: 'Profile updated successfully!'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user profile.' });
  }
}

export async function getDemoAccounts(req: Request, res: Response) {
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
  } catch (err: any) {
    res.status(500).json({ error: 'Error fetching demo accounts.' });
  }
}
