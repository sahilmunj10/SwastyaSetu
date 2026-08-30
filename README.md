# SWASTHYA SETU (स्वास्थ्य सेतू)
### *"Connecting Every Patient to the Right Care, at the Right Time."*

**Smart India Hackathon (SIH) Software Prototype**  
**Problem Statement ID:** 26133  
**Organization:** Government of Maharashtra (Maharashtra State Innovation Society, Dept. of Skills, Employment, Entrepreneurship & Innovation)  
**Theme:** MedTech / BioTech / HealthTech  

---

## 📌 Executive Summary

Rural and underserved communities across India face significant public healthcare challenges: long travel distances, shortage of specialists at primary health centres (PHC), fragmented physical medical paperwork, delayed referrals, and medicine stockouts.

**SWASTHYA SETU** is an intelligent care-access and continuity layer that strengthens existing government healthcare infrastructure by uniting:
$$\text{Patient} \longleftrightarrow \text{Frontline ASHA Worker} \longleftrightarrow \text{PHC Medical Officer} \longleftrightarrow \text{Diagnostics} \longleftrightarrow \text{Pharmacy Store} \longleftrightarrow \text{District Hospital} \longleftrightarrow \text{State Health Authority}$$

Under the central design principle: **ONE PATIENT → ONE CONTINUOUS HEALTHCARE JOURNEY**.

---

## 🚀 Key Features & Capabilities

1. **Assisted Teleconsultation Suite**: Connects rural sub-centres to PHC/Specialist doctors with specialized **Low-Bandwidth Mode** (2G/3G audio fallback, connection metrics, in-call prescription builder).
2. **Digital Guided Triage Screening Engine**: Algorithmic decision support classifying presenting conditions into `ROUTINE`, `MODERATE`, `HIGH`, and `EMERGENCY` with clinical reasoning.
3. **Longitudinal Patient Health Record (EHR)**: Unified timeline and interactive Recharts tracking blood pressure, glucose, SpO2, and lifetime encounters.
4. **8-Stage Inter-Facility Referral Tracking**: End-to-end referral lifecycle (`Created → Sent → Accepted → Scheduled → Arrived → Consulted → Closed`) with zero lost paperwork.
5. **Public Medicine Availability Finder**: Real-time stock search across government health centres, eliminating wasted travel.
6. **Public Diagnostic Coordination**: Automated pathology/imaging scheduling, specimen tracking, and digital laboratory verification.
7. **Offline-First PWA Synchronization**: Frontline ASHA workers can register citizens and record vitals without connectivity; data automatically queues in IndexedDB and flushes upon network return.
8. **Government & District Health Officer GIS Analytics**: High-level KPI dashboards, facility wait times, referral completion funnel, and interactive Leaflet GIS map.
9. **Multilingual & Voice-First Accessibility**: Real-time localization in **English**, **मराठी (Marathi)**, and **हिंदी (Hindi)** with Web Speech API voice input.
10. **Interactive "Meena's Healthcare Journey" Master Demo**: 15-step sequential walkthrough showcasing the complete continuum of care for a high-risk pregnant mother.

---

## 👥 Seeded Demo Credentials

Use the floating **⚡ SIH Live Demo Bar** at the top of the app to switch roles with **1-click**, or log in using these demo credentials:

| Role | Name / Facility | Email | Demo Password |
| :--- | :--- | :--- | :--- |
| **Patient** | Meena Ramesh Patil | `patient@swasthysetu.demo` | `patient123` |
| **ASHA Worker** | Sunita Gaikwad (ASHA Kalyan) | `asha@swasthysetu.demo` | `asha123` |
| **PHC Doctor** | Dr. Rajesh Kulkarni (Medical Officer) | `doctor@swasthysetu.demo` | `doctor123` |
| **Diagnostic Lab** | Prakash Shinde (Sr. Lab Technician) | `lab@swasthysetu.demo` | `lab123` |
| **Pharmacy Officer** | Milind Deshmukh (Pharmacist) | `pharmacy@swasthysetu.demo` | `pharmacy123` |
| **Facility Admin** | Kavita Chavan (Superintendent) | `admin@swasthysetu.demo` | `admin123` |
| **District Officer** | Dr. Sandeep Mane (DHO Thane) | `officer@swasthysetu.demo` | `officer123` |

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Leaflet, React-Leaflet, IndexedDB (`idb-keyval`), Web Speech API.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, SQLite database (self-contained zero-config), JWT, bcryptjs, Morgan.
- **Standards Alignment**: ABDM / ABHA Health ID compatibility, FHIR-style resource schemas.

---

## ⚡ Quickstart & Local Setup

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### 2. Install & Start Everything
Clone the repository and run:

```bash
# 1. Install Backend & Frontend dependencies
cd backend && npm install && cd ../frontend && npm install && cd ..

# 2. Setup and Seed the SQLite Database
cd backend && npx prisma db push && npm run seed && cd ..

# 3. Start Backend & Frontend concurrently
# In Terminal 1 (Backend):
cd backend && npm run dev

# In Terminal 2 (Frontend):
cd frontend && npm run dev
```

Open your browser at: **`http://localhost:5173`** (Frontend) and **`http://localhost:5000/health`** (Backend API).

---

## 📖 Complete Documentation

- [System Architecture & Design Docs](file:///f:/projects/SwastyaSetu/docs/architecture.md)
- [REST API Reference](file:///f:/projects/SwastyaSetu/docs/api.md)
- [SIH Jury Presentation & Demo Guide](file:///f:/projects/SwastyaSetu/docs/demo_guide.md)
