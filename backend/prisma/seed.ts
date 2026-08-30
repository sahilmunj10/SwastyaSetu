import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Clearing existing database records...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.triageAssessment.deleteMany();
  await prisma.vital.deleteMany();
  await prisma.healthRecord.deleteMany();
  await prisma.diagnosticRequest.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
  await prisma.facility.deleteMany();

  console.log('🏥 Seeding Maharashtra Public Healthcare Facilities...');
  const facilityKalyan = await prisma.facility.create({
    data: {
      name: 'Primary Health Centre (PHC) Kalyan Rural',
      type: 'PHC',
      district: 'Thane',
      address: 'Kalyan-Murbad Road, Gandhre Village, Kalyan 421301',
      latitude: 19.2437,
      longitude: 73.1355,
      contactPhone: '+91 251 220 4112',
      bedCapacity: 15,
      activeDoctors: 4,
      activeServices: JSON.stringify(['OPD', 'Telemedicine Suite', 'Basic Pathology', 'Maternal ANC Clinic', 'Essential Pharmacy', 'Immunization'])
    }
  });

  const facilityDombivli = await prisma.facility.create({
    data: {
      name: 'Sub-District Rural Hospital Dombivli',
      type: 'RURAL_HOSPITAL',
      district: 'Thane',
      address: 'Manpada Road, Dombivli East, Thane 421201',
      latitude: 19.2183,
      longitude: 73.0867,
      contactPhone: '+91 251 286 1930',
      bedCapacity: 50,
      activeDoctors: 12,
      activeServices: JSON.stringify(['General Medicine', 'Emergency 24x7', 'X-Ray & Sonography', 'Inpatient Ward', 'Pediatric Unit', 'Blood Storage'])
    }
  });

  const facilityThane = await prisma.facility.create({
    data: {
      name: 'Thane District Civil Hospital',
      type: 'DISTRICT_HOSPITAL',
      district: 'Thane',
      address: 'Court Naka, Kharkar Alley, Thane West 400601',
      latitude: 19.1982,
      longitude: 72.9781,
      contactPhone: '+91 22 2534 5000',
      bedCapacity: 350,
      activeDoctors: 48,
      activeServices: JSON.stringify(['Multi-Specialty OPD', 'OB/GYN High-Risk Clinic', 'Advanced Radiology & CT', 'ICU & Trauma', 'Blood Bank', 'Central Pathology Lab', 'Dialysis'])
    }
  });

  const facilityShahapur = await prisma.facility.create({
    data: {
      name: 'PHC Shahapur Tribal Belt',
      type: 'PHC',
      district: 'Thane',
      address: 'Agra Road, Shahapur Rural 421601',
      latitude: 19.4529,
      longitude: 73.3308,
      contactPhone: '+91 2527 272 105',
      bedCapacity: 10,
      activeDoctors: 3,
      activeServices: JSON.stringify(['OPD', 'Maternal & Child Health', 'Malaria/Dengue Screening', 'Basic Pharmacy', 'Tele-consultation'])
    }
  });

  const facilityBhiwandi = await prisma.facility.create({
    data: {
      name: 'Rural Sub-District Hospital Bhiwandi',
      type: 'RURAL_HOSPITAL',
      district: 'Thane',
      address: 'Kalyan Road, Bhiwandi 421302',
      latitude: 19.2967,
      longitude: 73.0631,
      contactPhone: '+91 2522 254 880',
      bedCapacity: 80,
      activeDoctors: 18,
      activeServices: JSON.stringify(['OPD', 'Surgical Ward', 'Maternity Ward', 'Clinical Laboratory', '24x7 Casualty'])
    }
  });

  console.log('👥 Seeding Demo Users for all 7 roles...');
  const salt = await bcrypt.genSalt(10);
  
  const userPatient = await prisma.user.create({
    data: {
      name: 'Meena Ramesh Patil',
      email: 'patient@swasthysetu.demo',
      phone: '9823412345',
      passwordHash: await bcrypt.hash('patient123', salt),
      role: 'PATIENT',
      facilityId: facilityKalyan.id,
      abhaId: '91-4432-8819-2041'
    }
  });

  const userAsha = await prisma.user.create({
    data: {
      name: 'Sunita Gaikwad (ASHA Worker)',
      email: 'asha@swasthysetu.demo',
      phone: '9823498765',
      passwordHash: await bcrypt.hash('asha123', salt),
      role: 'ASHA',
      facilityId: facilityKalyan.id,
      abhaId: '91-7711-2098-5544'
    }
  });

  const userDoctor = await prisma.user.create({
    data: {
      name: 'Dr. Rajesh Kulkarni (Medical Officer)',
      email: 'doctor@swasthysetu.demo',
      phone: '9822156789',
      passwordHash: await bcrypt.hash('doctor123', salt),
      role: 'DOCTOR',
      facilityId: facilityKalyan.id,
      abhaId: '91-1122-3344-5566'
    }
  });

  const userDoctorSpecialist = await prisma.user.create({
    data: {
      name: 'Dr. Ananya Joshi (MD, OB/GYN Specialist)',
      email: 'specialist@swasthysetu.demo',
      phone: '9822001122',
      passwordHash: await bcrypt.hash('doctor123', salt),
      role: 'DOCTOR',
      facilityId: facilityThane.id,
      abhaId: '91-8899-7766-5544'
    }
  });

  const userLab = await prisma.user.create({
    data: {
      name: 'Prakash Shinde (Senior Lab Technician)',
      email: 'lab@swasthysetu.demo',
      phone: '9823334455',
      passwordHash: await bcrypt.hash('lab123', salt),
      role: 'LAB',
      facilityId: facilityKalyan.id
    }
  });

  const userPharmacy = await prisma.user.create({
    data: {
      name: 'Milind Deshmukh (Pharmacist Officer)',
      email: 'pharmacy@swasthysetu.demo',
      phone: '9821122334',
      passwordHash: await bcrypt.hash('pharmacy123', salt),
      role: 'PHARMACY',
      facilityId: facilityKalyan.id
    }
  });

  const userAdmin = await prisma.user.create({
    data: {
      name: 'Kavita Chavan (Facility Superintendent)',
      email: 'admin@swasthysetu.demo',
      phone: '9824455667',
      passwordHash: await bcrypt.hash('admin123', salt),
      role: 'ADMIN',
      facilityId: facilityKalyan.id
    }
  });

  const userOfficer = await prisma.user.create({
    data: {
      name: 'Dr. Sandeep Mane (District Health Officer)',
      email: 'officer@swasthysetu.demo',
      phone: '9829988776',
      passwordHash: await bcrypt.hash('officer123', salt),
      role: 'DISTRICT_OFFICER',
      facilityId: facilityThane.id
    }
  });

  console.log('🩺 Seeding Patient Records (including Meena Patil)...');
  // Patient 1: Meena Patil (Main Demo Story)
  const patientMeena = await prisma.patient.create({
    data: {
      patientId: 'MH-THN-00101',
      name: 'Meena Ramesh Patil',
      age: 24,
      gender: 'Female',
      phone: '9823412345',
      village: 'Gandhre Village, Kalyan',
      address: 'House No. 42, Near Maruti Mandir, Gandhre, Kalyan 421301',
      emergencyContact: 'Ramesh Patil (Husband) - 9823412346',
      pregnancyStatus: true,
      gestationalWeeks: 28,
      bloodGroup: 'O+',
      chronicConditions: 'Gestational Hypertension (High Risk ANC)',
      allergies: 'Penicillin',
      registeredByAshaId: userAsha.id,
      facilityId: facilityKalyan.id
    }
  });

  // Patient 2: Ramesh Jadhav (Hypertension & Diabetes)
  const patientRamesh = await prisma.patient.create({
    data: {
      patientId: 'MH-THN-00102',
      name: 'Ramesh Narayan Jadhav',
      age: 58,
      gender: 'Male',
      phone: '9820011223',
      village: 'Titwala Rural',
      address: 'Room 12, Ganpati Wadi, Titwala 421605',
      emergencyContact: 'Sachin Jadhav (Son) - 9820011224',
      pregnancyStatus: false,
      bloodGroup: 'B+',
      chronicConditions: 'Type 2 Diabetes, Hypertension',
      allergies: 'None',
      registeredByAshaId: userAsha.id,
      facilityId: facilityKalyan.id
    }
  });

  // Patient 3: Aarav Shinde (Child Immunization & Acute Respiratory)
  const patientAarav = await prisma.patient.create({
    data: {
      patientId: 'MH-THN-00103',
      name: 'Aarav Sachin Shinde',
      age: 3,
      gender: 'Male',
      phone: '9819922334',
      village: 'Murbad Road Hamlet',
      address: 'Plot 7, Murbad Road, Kalyan Rural 421401',
      emergencyContact: 'Pooja Shinde (Mother) - 9819922334',
      pregnancyStatus: false,
      bloodGroup: 'A+',
      chronicConditions: 'Childhood Wheezing / Bronchitis',
      registeredByAshaId: userAsha.id,
      facilityId: facilityKalyan.id
    }
  });

  // Patient 4: Laxmi Kamble (Senior Citizen - Osteoarthritis)
  const patientLaxmi = await prisma.patient.create({
    data: {
      patientId: 'MH-THN-00104',
      name: 'Laxmibai Tukaram Kamble',
      age: 67,
      gender: 'Female',
      phone: '9833445566',
      village: 'Shahapur Tribal Hamlet',
      address: 'Zilla Parishad School Road, Shahapur 421601',
      emergencyContact: 'Tukaram Kamble (Husband) - 9833445567',
      pregnancyStatus: false,
      bloodGroup: 'AB+',
      chronicConditions: 'Severe Osteoarthritis, Mild Anemia',
      registeredByAshaId: userAsha.id,
      facilityId: facilityShahapur.id
    }
  });

  // Patient 5: Priya Wagh (High-Risk First Trimester ANC)
  const patientPriya = await prisma.patient.create({
    data: {
      patientId: 'MH-THN-00105',
      name: 'Priya Ganesh Wagh',
      age: 21,
      gender: 'Female',
      phone: '9867112233',
      village: 'Dombivli Rural Zone',
      address: 'Wagh Pada, Near Lake, Dombivli East 421201',
      emergencyContact: 'Ganesh Wagh (Husband) - 9867112234',
      pregnancyStatus: true,
      gestationalWeeks: 12,
      bloodGroup: 'B-',
      chronicConditions: 'Severe Anemia (Hb 7.8 g/dL)',
      registeredByAshaId: userAsha.id,
      facilityId: facilityDombivli.id
    }
  });

  // Seed 15 more diverse patients for realistic population analytics
  const samplePatients = [
    { name: 'Sanjay Tukaram More', age: 46, gender: 'Male', village: 'Kalyan Rural', cond: 'Hypertension', bp: 'O+' },
    { name: 'Sunita Ashok Salunkhe', age: 34, gender: 'Female', village: 'Gandhre', cond: 'Hypothyroidism', bp: 'A+' },
    { name: 'Ganesh Bhau Shingote', age: 52, gender: 'Male', village: 'Titwala', cond: 'Chronic Kidney Disease Stage 2', bp: 'B+' },
    { name: 'Kavita Nilesh Gharat', age: 29, gender: 'Female', village: 'Bhiwandi Outer', cond: 'Post-partum Anemia', bp: 'AB+' },
    { name: 'Vishal Dilip Thorat', age: 19, gender: 'Male', village: 'Shahapur', cond: 'Acute Gastroenteritis', bp: 'O-' },
    { name: 'Parvati Somnath Dhas', age: 62, gender: 'Female', village: 'Murbad', cond: 'Type 2 Diabetes, Diabetic Foot', bp: 'A-' },
    { name: 'Rohit Chandrakant Kadam', age: 8, gender: 'Male', village: 'Kalyan Rural', cond: 'Pediatric Malnutrition Grade 1', bp: 'B+' },
    { name: 'Ankita Pradeep Sawant', age: 26, gender: 'Female', village: 'Gandhre', cond: 'ANC 2nd Trimester (Routine)', bp: 'O+' },
    { name: 'Babanrao Shankar Naik', age: 71, gender: 'Male', village: 'Dombivli Rural', cond: 'COPD, Hypertension', bp: 'B+' },
    { name: 'Manisha Deepak Bhagat', age: 38, gender: 'Female', village: 'Titwala', cond: 'Recurrent UTI, Renal Calculi', bp: 'A+' },
    { name: 'Dattatray Vithal Bhoir', age: 49, gender: 'Male', village: 'Kalyan Rural', cond: 'Essential Hypertension', bp: 'O+' },
    { name: 'Savita Rahul Mhatre', age: 23, gender: 'Female', village: 'Bhiwandi', cond: 'ANC 3rd Trimester (High Risk)', bp: 'B+' },
    { name: 'Tanmay Amit Rane', age: 5, gender: 'Male', village: 'Shahapur', cond: 'Pneumonia Screening', bp: 'A+' },
    { name: 'Sudhir Jayram Ghodke', age: 55, gender: 'Male', village: 'Gandhre', cond: 'Ischemic Heart Disease Follow-up', bp: 'AB+' },
    { name: 'Alka Madhav Deshpande', age: 60, gender: 'Female', village: 'Dombivli', cond: 'Osteoporosis, Glaucoma', bp: 'O+' }
  ];

  for (let i = 0; i < samplePatients.length; i++) {
    const sp = samplePatients[i];
    await prisma.patient.create({
      data: {
        patientId: `MH-THN-001${10 + i}`,
        name: sp.name,
        age: sp.age,
        gender: sp.gender,
        phone: `98${20000000 + i * 1111}`,
        village: sp.village,
        address: `${sp.village}, Thane District, Maharashtra`,
        emergencyContact: `Family - 98${20000000 + i * 1111 + 1}`,
        pregnancyStatus: sp.cond.includes('ANC'),
        gestationalWeeks: sp.cond.includes('ANC') ? 24 : null,
        bloodGroup: sp.bp,
        chronicConditions: sp.cond,
        facilityId: i % 2 === 0 ? facilityKalyan.id : facilityDombivli.id
      }
    });
  }

  console.log('📈 Seeding Vitals and Longitudinal Health History for Meena...');
  // Meena Vitals History
  await prisma.vital.createMany({
    data: [
      {
        patientId: patientMeena.id,
        systolicBp: 120,
        diastolicBp: 80,
        heartRate: 76,
        spo2: 98,
        temperature: 98.4,
        bloodGlucose: 92,
        weight: 56.5,
        recordedBy: 'Sunita Gaikwad (ASHA)',
        recordedRole: 'ASHA',
        notes: 'Routine 1st ANC Visit at Sub-Centre. Vitals stable.',
        recordedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: patientMeena.id,
        systolicBp: 132,
        diastolicBp: 86,
        heartRate: 82,
        spo2: 98,
        temperature: 98.6,
        bloodGlucose: 104,
        weight: 59.0,
        recordedBy: 'Sunita Gaikwad (ASHA)',
        recordedRole: 'ASHA',
        notes: '2nd ANC Visit. Mild elevation in BP noted, advised reduced salt and rest.',
        recordedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: patientMeena.id,
        systolicBp: 152,
        diastolicBp: 96,
        heartRate: 88,
        spo2: 97,
        temperature: 98.8,
        bloodGlucose: 118,
        weight: 62.0,
        recordedBy: 'Sunita Gaikwad (ASHA)',
        recordedRole: 'ASHA',
        notes: 'Today home visit. Patient complains of persistent severe headache, pedal edema (swollen feet), and mild blurred vision. Blood pressure significantly elevated 152/96 mmHg.',
        recordedAt: new Date()
      }
    ]
  });

  // Vitals for Ramesh Jadhav
  await prisma.vital.createMany({
    data: [
      {
        patientId: patientRamesh.id,
        systolicBp: 148,
        diastolicBp: 94,
        heartRate: 78,
        spo2: 96,
        temperature: 98.2,
        bloodGlucose: 184,
        weight: 74.0,
        recordedBy: 'Dr. Rajesh Kulkarni',
        recordedRole: 'DOCTOR',
        notes: 'Monthly NCD follow-up. Blood sugar fasting 184 mg/dL, BP slightly high.',
        recordedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        patientId: patientRamesh.id,
        systolicBp: 138,
        diastolicBp: 88,
        heartRate: 74,
        spo2: 97,
        temperature: 98.4,
        bloodGlucose: 142,
        weight: 73.2,
        recordedBy: 'Sunita Gaikwad (ASHA)',
        recordedRole: 'ASHA',
        notes: 'ASHA home visit checkup. Medication compliance verified.',
        recordedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  console.log('🚨 Seeding Triage Assessments...');
  await prisma.triageAssessment.create({
    data: {
      patientId: patientMeena.id,
      symptoms: JSON.stringify(['Severe Headache', 'Swollen Feet / Pedal Edema', 'Blurred Vision', 'High Blood Pressure in 3rd Trimester']),
      symptomDuration: '3 days',
      ruleTriggered: 'MATERNAL_GESTATIONAL_HYPERTENSION_PREECLAMPSIA_RISK',
      riskLevel: 'HIGH',
      clinicalReasoning: 'Gestational age 28 weeks with acute Systolic BP >= 150 mmHg, Diastolic BP >= 95 mmHg accompanied by neurologic symptoms (headache, vision changes). High risk of pre-eclampsia requiring urgent specialist OB/GYN evaluation.',
      recommendedAction: 'Urgent teleconsultation with Medical Officer, order spot urine protein test, escalate referral to Thane District Hospital OB/GYN.',
      assessedBy: 'Sunita Gaikwad (ASHA)',
      assessedAt: new Date()
    }
  });

  console.log('📅 Seeding Appointments and Queue...');
  const apptMeena = await prisma.appointment.create({
    data: {
      patientId: patientMeena.id,
      doctorId: userDoctor.id,
      facilityId: facilityKalyan.id,
      tokenNumber: 'A-024',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '10:30 AM',
      queuePosition: 2,
      status: 'IN_PROGRESS',
      mode: 'TELECONSULTATION',
      urgency: 'HIGH',
      reason: 'Urgent ANC Tele-Triage Evaluation: High BP & Pre-eclampsia symptoms'
    }
  });

  const apptRamesh = await prisma.appointment.create({
    data: {
      patientId: patientRamesh.id,
      doctorId: userDoctor.id,
      facilityId: facilityKalyan.id,
      tokenNumber: 'A-025',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '11:00 AM',
      queuePosition: 3,
      status: 'WAITING',
      mode: 'PHYSICAL',
      urgency: 'ROUTINE',
      reason: 'Monthly NCD Diabetes & Hypertension Prescription Refill'
    }
  });

  const apptAarav = await prisma.appointment.create({
    data: {
      patientId: patientAarav.id,
      doctorId: userDoctor.id,
      facilityId: facilityKalyan.id,
      tokenNumber: 'A-023',
      date: new Date().toISOString().split('T')[0],
      timeSlot: '10:00 AM',
      queuePosition: 1,
      status: 'COMPLETED',
      mode: 'PHYSICAL',
      urgency: 'MODERATE',
      reason: 'Child Fever & Wheezing assessment'
    }
  });

  console.log('🔬 Seeding Diagnostics (Urine Protein, CBC, HbA1c)...');
  const diagUrineMeena = await prisma.diagnosticRequest.create({
    data: {
      patientId: patientMeena.id,
      doctorId: userDoctor.id,
      facilityId: facilityKalyan.id,
      testName: 'Urine Routine & Spot Protein (Albumin)',
      testCategory: 'Pathology',
      priority: 'HIGH',
      status: 'VERIFIED',
      appointmentDate: new Date().toISOString().split('T')[0],
      sampleCollectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      reportFindings: 'Urine Albumin: +2 (Significant Proteinuria). Specific Gravity: 1.025. Pus cells: 2-3 / hpf. Positive for proteinuria indicating pre-eclampsia in pregnancy.',
      normalRange: 'Nil / Trace',
      testValue: '+2 (Proteinuria)',
      isAbnormal: true,
      verifiedBy: 'Prakash Shinde (Lab Technician)',
      verifiedAt: new Date(Date.now() - 30 * 60 * 1000)
    }
  });

  const diagCbcMeena = await prisma.diagnosticRequest.create({
    data: {
      patientId: patientMeena.id,
      doctorId: userDoctor.id,
      facilityId: facilityKalyan.id,
      testName: 'Complete Blood Count (CBC) with Platelet Count',
      testCategory: 'Pathology',
      priority: 'HIGH',
      status: 'VERIFIED',
      appointmentDate: new Date().toISOString().split('T')[0],
      sampleCollectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      reportFindings: 'Hemoglobin: 9.8 g/dL (Mild Anemia), Platelet Count: 185,000 /mcL (Adequate, no HELLP syndrome signs yet), Total WBC: 8,900 /cumm.',
      normalRange: 'Hb: 11.5-15.0 g/dL, Platelets: 150k-450k',
      testValue: 'Hb 9.8 g/dL, Platelets 185k',
      isAbnormal: true,
      verifiedBy: 'Prakash Shinde (Lab Technician)',
      verifiedAt: new Date(Date.now() - 20 * 60 * 1000)
    }
  });

  await prisma.diagnosticRequest.create({
    data: {
      patientId: patientRamesh.id,
      doctorId: userDoctor.id,
      facilityId: facilityKalyan.id,
      testName: 'Glycated Hemoglobin (HbA1c)',
      testCategory: 'Biochemistry',
      priority: 'ROUTINE',
      status: 'VERIFIED',
      appointmentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reportFindings: 'HbA1c: 7.8% (Sub-optimal glycemic control). Fasting Blood Glucose: 184 mg/dL.',
      normalRange: '< 5.7% (Normal), < 7.0% (Controlled Diabetic)',
      testValue: '7.8%',
      isAbnormal: true,
      verifiedBy: 'Prakash Shinde (Lab Technician)',
      verifiedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('🔄 Seeding Referral Lifecycle (Meena -> Thane District Hospital)...');
  const referralMeena = await prisma.referral.create({
    data: {
      patientId: patientMeena.id,
      referringDoctorId: userDoctor.id,
      originFacilityId: facilityKalyan.id,
      destinationFacilityId: facilityThane.id,
      reason: 'Gestational Hypertension with Significant Proteinuria (+2) at 28 Weeks Gestation (High-Risk Pregnancy)',
      clinicalSummary: '24-year-old Primigravida at 28 weeks gestation presented with BP 152/96 mmHg, persistent headache, pedal edema and Urine Albumin +2. Initiated Tab Labetalol 100mg BD. Referred to Thane Civil Hospital High-Risk OB/GYN Unit for urgent fetal ultrasound Doppler, biophysical profile and specialized inpatient management.',
      priority: 'HIGH',
      status: 'ACCEPTED',
      trackingTimeline: JSON.stringify([
        { stage: 'CREATED', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), actor: 'Dr. Rajesh Kulkarni (PHC Kalyan)', notes: 'Urgent referral initiated with verified digital lab attachment.' },
        { stage: 'SENT', timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000), actor: 'Swasthya Setu Gateway', notes: 'Electronic transfer token #REF-MH-2026-0892 transmitted to Thane District Hospital.' },
        { stage: 'ACCEPTED', timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), actor: 'Dr. Ananya Joshi (OB/GYN Thane Civil)', notes: 'Referral accepted. Priority High-Risk slot assigned for tomorrow morning 09:30 AM.' }
      ])
    }
  });

  console.log('💊 Seeding Public Facility Medicine Inventory...');
  const medicines = [
    { name: 'Labetalol 100 mg', generic: 'Labetalol Hydrochloride', cat: 'Antihypertensive', str: '100mg', form: 'Tablet', qty: 350, thr: 80, fac: facilityKalyan.id },
    { name: 'Methyldopa 250 mg', generic: 'Methyldopa', cat: 'Antihypertensive', str: '250mg', form: 'Tablet', qty: 200, thr: 50, fac: facilityKalyan.id },
    { name: 'Iron and Folic Acid (IFA)', generic: 'Ferrous Sulfate + Folic Acid', cat: 'Maternal Health', str: '100mg + 0.5mg', form: 'Tablet', qty: 1200, thr: 300, fac: facilityKalyan.id },
    { name: 'Calcium + Vitamin D3', generic: 'Calcium Carbonate + Cholecalciferol', cat: 'Maternal Health', str: '500mg + 250IU', form: 'Tablet', qty: 950, thr: 250, fac: facilityKalyan.id },
    { name: 'Paracetamol 500 mg', generic: 'Paracetamol / Acetaminophen', cat: 'Analgesic', str: '500mg', form: 'Tablet', qty: 1800, thr: 400, fac: facilityKalyan.id },
    { name: 'Metformin 500 mg', generic: 'Metformin Hydrochloride', cat: 'Antidiabetic', str: '500mg', form: 'Tablet', qty: 35, thr: 100, fac: facilityKalyan.id }, // LOW STOCK ALERT
    { name: 'Amlodipine 5 mg', generic: 'Amlodipine Besylate', cat: 'Antihypertensive', str: '5mg', form: 'Tablet', qty: 15, thr: 100, fac: facilityKalyan.id }, // LOW STOCK ALERT
    { name: 'Amoxicillin 500 mg', generic: 'Amoxicillin Trihydrate', cat: 'Antibiotics', str: '500mg', form: 'Capsule', qty: 450, thr: 150, fac: facilityKalyan.id },
    { name: 'Oral Rehydration Salts (ORS)', generic: 'WHO Formula Electrolytes', cat: 'Pediatric', str: '21.8g Sachet', form: 'Powder', qty: 600, thr: 150, fac: facilityKalyan.id },
    { name: 'Magnesium Sulfate 50% Injection', generic: 'Magnesium Sulfate', cat: 'Maternal Emergency', str: '50% w/v (2ml ampoule)', form: 'Injection', qty: 40, thr: 20, fac: facilityKalyan.id },
    // Dombivli medicines
    { name: 'Metformin 500 mg', generic: 'Metformin Hydrochloride', cat: 'Antidiabetic', str: '500mg', form: 'Tablet', qty: 850, thr: 150, fac: facilityDombivli.id },
    { name: 'Amlodipine 5 mg', generic: 'Amlodipine Besylate', cat: 'Antihypertensive', str: '5mg', form: 'Tablet', qty: 620, thr: 100, fac: facilityDombivli.id },
    { name: 'Paracetamol 500 mg', generic: 'Paracetamol / Acetaminophen', cat: 'Analgesic', str: '500mg', form: 'Tablet', qty: 2500, thr: 500, fac: facilityDombivli.id },
    { name: 'Labetalol 100 mg', generic: 'Labetalol Hydrochloride', cat: 'Antihypertensive', str: '100mg', form: 'Tablet', qty: 500, thr: 100, fac: facilityDombivli.id },
    // Thane Civil Hospital medicines
    { name: 'Labetalol 100 mg', generic: 'Labetalol Hydrochloride', cat: 'Antihypertensive', str: '100mg', form: 'Tablet', qty: 2400, thr: 300, fac: facilityThane.id },
    { name: 'Magnesium Sulfate 50% Injection', generic: 'Magnesium Sulfate', cat: 'Maternal Emergency', str: '50% w/v', form: 'Injection', qty: 320, thr: 50, fac: facilityThane.id },
    { name: 'Insulin Glargine 100 IU/ml', generic: 'Recombinant Human Insulin', cat: 'Antidiabetic', str: '100 IU/ml', form: 'Vial', qty: 180, thr: 40, fac: facilityThane.id }
  ];

  for (const med of medicines) {
    await prisma.medicine.create({
      data: {
        name: med.name,
        genericName: med.generic,
        category: med.cat,
        strength: med.str,
        dosageForm: med.form,
        facilityId: med.fac,
        quantity: med.qty,
        reorderThreshold: med.thr,
        batchNumber: `BAT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        expiryDate: '2027-11-30',
        isAvailable: med.qty > 0
      }
    });
  }

  console.log('📌 Seeding Follow-Up Tasks for ASHA and Patients...');
  await prisma.followUp.createMany({
    data: [
      {
        patientId: patientMeena.id,
        assignedWorkerId: userAsha.id,
        category: 'MATERNAL_ANC',
        description: 'Post-Referral Home Visit: Verify BP stabilization on Tab Labetalol, check for fetal movements, and ensure attendance at Thane District Hospital appointment tomorrow.',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'PENDING',
        priority: 'CRITICAL',
        aiRiskScore: 0.85,
        notes: 'High-risk case requiring mandatory same-day check by ASHA Sunita.'
      },
      {
        patientId: patientRamesh.id,
        assignedWorkerId: userAsha.id,
        category: 'CHRONIC_DISEASE',
        description: 'Monthly NCD Vitals Check: Blood Pressure and Fasting Blood Glucose re-evaluation.',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'PENDING',
        priority: 'HIGH',
        aiRiskScore: 0.42,
        notes: 'Check dietary compliance and ensure Metformin supply is replenished.'
      },
      {
        patientId: patientPriya.id,
        assignedWorkerId: userAsha.id,
        category: 'MATERNAL_ANC',
        description: 'First Trimester High-Risk Anemia Home Visit: Deliver IFA supplements, nutrition counseling, and confirm 2nd ANC scan booking.',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'OVERDUE',
        priority: 'HIGH',
        aiRiskScore: 0.78,
        notes: 'ANC visit overdue by 1 day! Send urgent SMS reminder.'
      },
      {
        patientId: patientAarav.id,
        assignedWorkerId: userAsha.id,
        category: 'CHILD_IMMUNIZATION',
        description: 'DPT Booster 1 & Oral Polio Vaccine Booster dose due.',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'PENDING',
        priority: 'ROUTINE',
        aiRiskScore: 0.15,
        notes: 'Coordinate with Tuesday Village Village Health & Nutrition Day (VHND).'
      }
    ]
  });

  console.log('🔔 Seeding System Notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: userAsha.id,
        type: 'HIGH_RISK',
        title: 'High-Risk Pregnancy Alert: Meena Patil',
        message: 'Triage engine flagged Meena Patil (Gestational age 28 weeks, BP 152/96 mmHg). Urgent teleconsultation and home visit required.',
        link: '/asha',
        read: false
      },
      {
        userId: userDoctor.id,
        type: 'REFERRAL',
        title: 'Referral Accepted by Thane District Hospital',
        message: 'Referral for Meena Patil #REF-MH-2026-0892 has been accepted by Dr. Ananya Joshi (OB/GYN).',
        link: '/doctor',
        read: false
      },
      {
        userId: userPharmacy.id,
        type: 'MEDICINE',
        title: 'Critical Low-Stock Warning: Metformin 500mg',
        message: 'Stock has fallen below threshold (35 tablets remaining, threshold: 100). Indent request auto-drafted.',
        link: '/pharmacy',
        read: false
      },
      {
        userId: userPatient.id,
        type: 'APPOINTMENT',
        title: 'Your Specialist Referral is Confirmed',
        message: 'Your appointment at Thane District Civil Hospital OB/GYN clinic is scheduled for tomorrow at 09:30 AM (Token #SP-104).',
        link: '/patient',
        read: false
      }
    ]
  });

  console.log('🛡️ Seeding Audit Trail Logs...');
  await prisma.auditLog.createMany({
    data: [
      {
        userId: userAsha.id,
        userName: 'Sunita Gaikwad',
        userRole: 'ASHA',
        action: 'TRIAGE_SCREENING',
        entity: 'Patient',
        entityId: patientMeena.id,
        details: 'Assessed Meena Patil via Digital Guided Triage. Flagged HIGH RISK for pre-eclampsia.'
      },
      {
        userId: userDoctor.id,
        userName: 'Dr. Rajesh Kulkarni',
        userRole: 'DOCTOR',
        action: 'CREATE_REFERRAL',
        entity: 'Referral',
        entityId: referralMeena.id,
        details: 'Created electronic referral for Patient #MH-THN-00101 to Thane District Hospital OB/GYN Unit.'
      },
      {
        userId: userLab.id,
        userName: 'Prakash Shinde',
        userRole: 'LAB',
        action: 'VERIFY_REPORT',
        entity: 'DiagnosticRequest',
        entityId: diagUrineMeena.id,
        details: 'Verified and signed Urine Albumin Spot Protein test report (+2 Proteinuria).'
      }
    ]
  });

  console.log('✅ Database seeding completed successfully with 100% realistic public health demo data!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
