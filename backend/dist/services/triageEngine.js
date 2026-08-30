"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateTriage = evaluateTriage;
function evaluateTriage(input) {
    const disclaimer = 'AI-assisted clinical decision support screening aid. Final clinical judgment must be made by a qualified healthcare professional.';
    const symptoms = (input.symptoms || []).map(s => s.toLowerCase());
    const sysBp = input.systolicBp || 0;
    const diaBp = input.diastolicBp || 0;
    const spo2 = input.spo2 || 100;
    const hr = input.heartRate || 75;
    const temp = input.temperature || 98.4;
    const isPreg = !!input.isPregnant;
    const duration = input.symptomDuration || 'Recent';
    // 1. Critical Emergency Triggers
    const hasChestPain = symptoms.some(s => s.includes('chest pain') || s.includes('heart pain') || s.includes('left arm pain'));
    const hasSevereDyspnea = symptoms.some(s => s.includes('severe breathing') || s.includes('cannot breathe') || s.includes('gasping')) || (spo2 > 0 && spo2 < 90);
    const hasUnconsciousness = symptoms.some(s => s.includes('unconscious') || s.includes('fainting') || s.includes('unresponsive') || s.includes('seizure') || s.includes('convulsion'));
    const hasSevereHemorrhage = symptoms.some(s => s.includes('severe bleeding') || s.includes('heavy bleeding') || s.includes('hemorrhage'));
    if (hasChestPain || hasSevereDyspnea || hasUnconsciousness || hasSevereHemorrhage) {
        return {
            riskLevel: 'EMERGENCY',
            ruleTriggered: 'CRITICAL_LIFE_THREATENING_RED_FLAGS',
            clinicalReasoning: `Patient exhibits life-threatening emergency signs: ${[
                hasChestPain ? 'Acute Severe Chest Pain' : '',
                hasSevereDyspnea ? `Severe Respiratory Distress (SpO2: ${spo2}%)` : '',
                hasUnconsciousness ? 'Altered Consciousness / Seizure' : '',
                hasSevereHemorrhage ? 'Active Acute Hemorrhage' : ''
            ].filter(Boolean).join(', ')}. Requires immediate stabilization.`,
            recommendedAction: 'Immediate Emergency Escalation! Dispatch 108 Ambulance, notify Medical Officer on duty, and route to nearest Emergency Casualty Unit.',
            urgencyLabel: '🚨 CRITICAL EMERGENCY (Immediate Evaluation)',
            disclaimer
        };
    }
    // 2. Maternal High-Risk / Pre-eclampsia / Obstetric Red Flags
    const hasPregnancySymptoms = symptoms.some(s => s.includes('headache') ||
        s.includes('vision') ||
        s.includes('swelling') ||
        s.includes('edema') ||
        s.includes('bleeding') ||
        s.includes('reduced fetal movement'));
    if (isPreg && ((sysBp >= 140 || diaBp >= 90) && hasPregnancySymptoms)) {
        return {
            riskLevel: 'HIGH',
            ruleTriggered: 'MATERNAL_GESTATIONAL_HYPERTENSION_PREECLAMPSIA',
            clinicalReasoning: `Pregnant patient (${input.gestationalWeeks || 'Active'} weeks) presents with elevated BP (${sysBp}/${diaBp} mmHg) along with neurologic/edema symptoms (${symptoms.join(', ')}). High risk of Pre-Eclampsia/Eclampsia requiring urgent OB/GYN intervention.`,
            recommendedAction: 'Book Priority Specialist Teleconsultation immediately, request spot Urine Protein test, and prepare referral to District Civil Hospital High-Risk Maternity Unit.',
            urgencyLabel: '⚠️ HIGH RISK (Maternal Urgent Assessment)',
            disclaimer
        };
    }
    // 3. High Risk Conditions (Abnormal vitals, pediatric lethargy, high persistent fever)
    const isHighBp = sysBp >= 160 || diaBp >= 100;
    const isHypoxic = spo2 > 0 && spo2 < 94;
    const isHighFever = temp >= 102.5;
    const isSeverePediatric = symptoms.some(s => s.includes('child lethargy') || s.includes('chest indrawing') || s.includes('unable to drink'));
    if (isHighBp || isHypoxic || isHighFever || isSeverePediatric) {
        return {
            riskLevel: 'HIGH',
            ruleTriggered: 'SEVERE_PHYSIOLOGICAL_ABNORMALITY',
            clinicalReasoning: `Critical physiological vitals detected: ${[
                isHighBp ? `Stage 2 Severe Hypertension (${sysBp}/${diaBp} mmHg)` : '',
                isHypoxic ? `Hypoxia (SpO2: ${spo2}%)` : '',
                isHighFever ? `High Grade Pyrexia (${temp}°F)` : '',
                isSeverePediatric ? 'Pediatric Danger Signs Detected' : ''
            ].filter(Boolean).join(', ')}. Requires same-day medical evaluation.`,
            recommendedAction: 'Schedule Priority Medical Officer evaluation at PHC within 2 hours. Order diagnostic vitals recheck.',
            urgencyLabel: '⚠️ HIGH RISK (Priority Evaluation Required)',
            disclaimer
        };
    }
    // 4. Moderate Risk (Moderate fever > 3 days, mild vitals deviation, chronic flare)
    const hasFever = symptoms.some(s => s.includes('fever') || s.includes('chills') || s.includes('body ache'));
    const hasCough = symptoms.some(s => s.includes('cough') || s.includes('throat') || s.includes('cold'));
    const hasDiarrhea = symptoms.some(s => s.includes('diarrhea') || s.includes('vomiting') || s.includes('loose motion'));
    const isModerateBp = (sysBp >= 135 && sysBp < 160) || (diaBp >= 85 && diaBp < 100);
    if (hasFever || hasCough || hasDiarrhea || isModerateBp) {
        return {
            riskLevel: 'MODERATE',
            ruleTriggered: 'ACUTE_SYMPTOMATIC_MODERATE_RISK',
            clinicalReasoning: `Patient reports symptomatic condition (${symptoms.join(', ')}) lasting ${duration} with ${isModerateBp ? `borderline elevated BP (${sysBp}/${diaBp} mmHg)` : 'stable vital parameters'}.`,
            recommendedAction: 'Book Standard Consultation with PHC Medical Officer. Advise hydration, symptom monitoring, and routine diagnostic panel.',
            urgencyLabel: '🟡 MODERATE RISK (Doctor Consultation Recommended)',
            disclaimer
        };
    }
    // 5. Default Routine
    return {
        riskLevel: 'ROUTINE',
        ruleTriggered: 'ROUTINE_PREVENTIVE_PRIMARY_CARE',
        clinicalReasoning: 'Vitals and reported observations fall within safe expected ranges. No acute red-flag indicators identified.',
        recommendedAction: 'Schedule routine OPD consultation or preventive follow-up check during next scheduled clinic session.',
        urgencyLabel: '🟢 ROUTINE (Routine Clinic / Follow-up)',
        disclaimer
    };
}
