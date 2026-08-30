# Architecture & Interoperability Specification: SWASTHYA SETU

## 1. Architectural Philosophy
SWASTHYA SETU is built around the **Continuum of Public Healthcare Care Access**:

```text
[ Village Sub-Centre / Home ]  <-- ASHA Worker (Mobile PWA, Offline First)
             ↓
[ Primary Health Centre (PHC) ] <-- Medical Officer (OPD Queue, Telemedicine, Vitals)
             ↓
[ Diagnostic & Pathology Lab ]  <-- Public Laboratory (Electronic verification)
             ↓
[ Sub-District / Rural Hospital ]<-- Specialist Review & Inpatient Stabilization
             ↓
[ District Civil Hospital ]      <-- Multi-Specialty Surgery & Advanced High-Risk Units
             ↓
[ Frontline ASHA Follow-up ]    <-- Closed Loop Post-Discharge Adherence
```

---

## 2. Rule-Based Triage Engine (`triageEngine.ts`)

The triage engine is designed as an **algorithmic decision-support screening aid**:

- **EMERGENCY (Red)**: Triggered by acute chest pain, SpO2 < 90%, altered sensorium/unconsciousness, severe obstetric hemorrhage, or active convulsions.
  - *Protocol*: 1-click Emergency Escalation to 108 Ambulance Hotline and on-duty casualty officer dispatch.
- **HIGH RISK (Amber)**: Triggered by maternal gestational hypertension (BP >= 140/90 mmHg at 28w gestation with headache/vision changes), high persistent fever, or stage 2 severe hypertension (BP >= 160/100 mmHg).
  - *Protocol*: Mandatory same-day medical officer teleconsultation + spot urine protein test.
- **MODERATE RISK (Blue)**: Triggered by moderate symptoms lasting > 3 days with stable vital parameters.
  - *Protocol*: Standard clinic appointment within 48 hours.
- **ROUTINE (Green)**: Routine preventive clinic visit.

---

## 3. Low-Bandwidth Teleconsultation Protocol

To solve rural connectivity limitations:
- **Audio Fallback**: Video frames are dropped when packet loss or latency exceeds thresholds, maintaining a lightweight audio channel (< 20 kbps).
- **Text & Vitals Stream**: Compact JSON telemetry maintains real-time vitals synchronization without buffering.
- **In-Call Rx & Orders**: Doctors can enter prescriptions and diagnostic orders simultaneously without leaving the call viewport.

---

## 4. Offline-First PWA Sync Engine (`offlineStorage.ts`)

Frontline workers in remote villages frequently lose cellular connectivity:
1. Operations (`REGISTER_PATIENT`, `RECORD_VITALS`) are saved into **IndexedDB / LocalStorage**.
2. A visual sync indicator shows `🟡 N records waiting to sync`.
3. When connectivity resumes or upon manual `Sync Now` click, batches are POSTed to `/api/patients/sync-offline`.
4. The server assigns unique state-wide IDs and resolves timestamp ordering.

---

## 5. Health Data Standards (ABDM & FHIR Compatibility)

Resources match standard FHIR schema definitions:
- `Patient`: Demographics, ABDM Health ID (`abhaId`), Village coordinates.
- `Observation`: Vital signs (Systolic BP, Diastolic BP, SpO2, Heart Rate, Glucose, Temp, Weight).
- `Encounter` / `Appointment`: Live queue token, time slot, facility reference.
- `DiagnosticReport`: Verified lab values, normal reference ranges, abnormal flags.
- `MedicationRequest`: Dosage, frequency, duration, instructions.
- `ServiceRequest` (Referral): Origin facility, Destination facility, Priority, 8-Stage tracking lifecycle.
