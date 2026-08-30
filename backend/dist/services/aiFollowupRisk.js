"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFollowupRisk = calculateFollowupRisk;
function calculateFollowupRisk(input) {
    let score = 0.1; // baseline
    const factors = [];
    if (input.isHighRiskPregnancy) {
        score += 0.40;
        factors.push('High-Risk Pregnancy (Gestational Complication)');
    }
    if (input.recentAbnormalVitals) {
        score += 0.25;
        factors.push('Recent Out-of-Range Vitals (Hypertension / Glucose spike)');
    }
    if (input.overdueDays && input.overdueDays > 0) {
        const overdueFactor = Math.min(0.25, input.overdueDays * 0.08);
        score += overdueFactor;
        factors.push(`Follow-up overdue by ${input.overdueDays} days`);
    }
    if (input.missedPreviousFollowups && input.missedPreviousFollowups > 0) {
        score += 0.20;
        factors.push(`History of ${input.missedPreviousFollowups} missed past clinical visits`);
    }
    if (input.hasChronicCondition) {
        score += 0.15;
        factors.push('Underlying Chronic Disease (NCD Co-morbidity)');
    }
    if (input.age && (input.age > 65 || input.age < 5)) {
        score += 0.10;
        factors.push('Vulnerable Demographic Age Bracket (Pediatric / Geriatric)');
    }
    // Clamp between 0.05 and 0.98
    score = Math.min(0.98, Math.max(0.05, Math.round(score * 100) / 100));
    let riskCategory = 'LOW';
    let recommendedIntervention = 'Routine SMS reminder prior to scheduled date.';
    if (score >= 0.75) {
        riskCategory = 'CRITICAL';
        recommendedIntervention = 'Mandatory same-day ASHA home visit with vitals check & direct phone call.';
    }
    else if (score >= 0.50) {
        riskCategory = 'HIGH';
        recommendedIntervention = 'Priority ASHA follow-up notification with transportation coordination.';
    }
    else if (score >= 0.30) {
        riskCategory = 'MEDIUM';
        recommendedIntervention = 'Automated regional language voice call (IVR) & ASHA task assignment.';
    }
    return {
        score,
        riskCategory,
        factors: factors.length > 0 ? factors : ['Routine health maintenance'],
        recommendedIntervention,
        disclaimer: 'AI-assisted predictive follow-up risk prioritization model — not a clinical diagnosis.'
    };
}
