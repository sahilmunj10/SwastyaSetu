# REST API Reference: SWASTHYA SETU

Base URL: `http://localhost:5000/api`

---

## 1. Authentication
- `POST /auth/login`: Authenticate by email/phone & password or demo role.
- `GET /auth/me`: Retrieve current logged-in user profile.
- `GET /auth/demo-accounts`: Retrieve seeded demo accounts for all 7 roles.

---

## 2. Patients & Longitudinal Records
- `GET /patients`: List patients (query: `search`, `village`, `isPregnant`, `facilityId`).
- `GET /patients/:id`: Retrieve longitudinal EHR (vitals, encounters, triage, labs, referrals).
- `POST /patients`: Register new patient with unique ID (`MH-THN-XXXXX`).
- `POST /patients/:id/vitals`: Record physiological vitals.
- `POST /patients/sync-offline`: Batch sync offline queued records from frontline devices.

---

## 3. Digital Guided Triage
- `POST /triage/evaluate`: Run rule-based triage screening algorithm.
  ```json
  {
    "patientId": "uuid",
    "symptoms": ["Severe Headache", "Swollen Feet", "Blurred Vision"],
    "symptomDuration": "3 days",
    "isPregnant": true,
    "gestationalWeeks": 28,
    "systolicBp": 152,
    "diastolicBp": 96
  }
  ```
- `GET /triage/history/:patientId`: Retrieve historical triage assessments.

---

## 4. Appointments & Live Queue
- `GET /appointments`: List appointments.
- `GET /appointments/queue/live`: Live dynamic queue with tokens, status, and wait times.
- `POST /appointments`: Book new appointment with automated token (e.g. `A-024`).
- `PATCH /appointments/:id/status`: Update queue status (`WAITING`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`).

---

## 5. Teleconsultation & Prescriptions
- `POST /teleconsult/complete`: Save consultation notes, prescriptions (Rx), and order diagnostic/referral handovers.

---

## 6. Referrals (8-Stage Lifecycle)
- `GET /referrals`: List referrals across facilities.
- `POST /referrals`: Create inter-facility electronic referral.
- `PATCH /referrals/:id/stage`: Transition lifecycle (`CREATED`, `SENT`, `ACCEPTED`, `SCHEDULED`, `ARRIVED`, `CONSULTED`, `CLOSED`).

---

## 7. Diagnostics
- `GET /diagnostics`: List lab orders.
- `GET /diagnostics/catalog`: Public lab test catalog.
- `POST /diagnostics`: Order diagnostic lab test.
- `PATCH /diagnostics/:id/status`: Update test status, findings, abnormal flag, and digital signature.

---

## 8. Medicine Inventory & Facility Search
- `GET /medicines`: List facility inventory with low-stock warnings.
- `GET /medicines/search?query=...`: Inter-facility stock search locator with distance estimates.
- `PATCH /medicines/:id/stock`: Update drug quantities and restock indents.

---

## 9. Follow-Ups & AI Risk
- `GET /followups`: List follow-up tasks.
- `POST /followups`: Schedule follow-up with predictive drop-off risk scoring.
- `PATCH /followups/:id/complete`: Record home visit completion.

---

## 10. Governance & District Dashboard
- `GET /dashboard/overview`: High-level KPIs, monthly trend charts, referral funnel, disease breakdown, and facility GIS scorecards.
- `GET /audit-logs`: Retrieve system access and security logs.
