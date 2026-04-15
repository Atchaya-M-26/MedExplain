const ExtractedData = require('../models/ExtractedData');
const { extractKeyValues } = require('../utils/ocrProcessor');

const DRUG_SUFFIXES = /\b\w+(?:in|ol|ine|ate|ide|mab|pril|sartan|statin|mycin|cillin|oxacin|azole|dipine|olol|artan|prazole|tidine|lukast|triptan|afil|oxetine|pamine|zepam|barbital|codone|morphine|fentanyl|tramadol)\b/gi;

const CONFLICT_PAIRS = [
  { drugs: ['warfarin', 'aspirin'],       note: 'Warfarin and Aspirin together may increase bleeding risk.' },
  { drugs: ['warfarin', 'ibuprofen'],     note: 'Warfarin and Ibuprofen together may increase bleeding risk.' },
  { drugs: ['metformin', 'alcohol'],      note: 'Metformin with alcohol may increase lactic acidosis risk.' },
  { drugs: ['lisinopril', 'potassium'],   note: 'ACE inhibitors with potassium supplements may cause hyperkalemia.' },
  { drugs: ['simvastatin', 'amlodipine'], note: 'High-dose Simvastatin with Amlodipine may increase myopathy risk.' },
  { drugs: ['clopidogrel', 'omeprazole'], note: 'Clopidogrel efficacy may be reduced by Omeprazole.' },
  { drugs: ['ssri', 'tramadol'],          note: 'SSRIs with Tramadol may increase serotonin syndrome risk.' },
  { drugs: ['digoxin', 'amiodarone'],     note: 'Digoxin levels may increase with Amiodarone co-administration.' },
];

// ── Extraction helpers ────────────────────────────────────────
function extractCondition(text) {
  if (!text || typeof text !== 'string') return 'General Checkup';
  const patterns = [
    /(?:primary\s+diagnosis|final\s+diagnosis|clinical\s+diagnosis)\s*[:\-]\s*([^\n.]{3,120})/i,
    /(?:diagnosis|impression|assessment|condition)\s*[:\-]\s*([^\n.]{3,120})/i,
    /(?:findings?)\s*[:\-]\s*([^\n.]{3,120})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1] && m[1].trim().length >= 3) return m[1].trim();
  }
  return 'General Checkup';
}

function extractMedicationsWithDosage(text) {
  if (!text || typeof text !== 'string') return [];
  const results = [];
  const seen = new Set();
  const medDosePattern = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|units?)(?:\s+(?:once|twice|thrice|\d+\s*times?)\s+(?:daily|a\s+day|per\s+day))?)/g;
  let m;
  while ((m = medDosePattern.exec(text)) !== null) {
    const name = m[1].trim();
    const dosage = m[2].trim();
    const key = name.toLowerCase();
    if (!seen.has(key) && name.length > 2) { seen.add(key); results.push({ name, dosage }); }
  }
  const lines = text.split('\n');
  for (const line of lines) {
    if (/prescribed|medication|drug|tablet|capsule|injection/i.test(line)) {
      const match = line.match(/(?:prescribed|medication|drug|tablet|capsule|injection)\s*[:\-]?\s*([A-Za-z][A-Za-z0-9\s\-]{1,40})/i);
      if (match && match[1]) {
        const name = match[1].trim().split(/\s{2,}|\t/)[0].trim();
        const key = name.toLowerCase();
        if (name.length > 1 && !seen.has(key)) { seen.add(key); results.push({ name, dosage: '' }); }
      }
    }
  }
  const suffixMatches = text.match(DRUG_SUFFIXES) || [];
  for (const raw of suffixMatches) {
    const name = raw.trim(); const key = name.toLowerCase();
    if (name.length > 3 && !seen.has(key)) { seen.add(key); results.push({ name, dosage: '' }); }
  }
  return results;
}

function extractTests(text) {
  if (!text || typeof text !== 'string') return [];
  const tests = new Set();
  const patterns = [
    /\b(CBC|complete blood count|blood count)\b/gi,
    /\b(LFT|liver function test)\b/gi,
    /\b(KFT|kidney function test|renal function)\b/gi,
    /\b(lipid profile|cholesterol panel)\b/gi,
    /\b(HbA1c|glycated hemoglobin)\b/gi,
    /\b(thyroid function|TSH|T3|T4)\b/gi,
    /\b(urine analysis|urinalysis)\b/gi,
    /\b(ECG|EKG|electrocardiogram)\b/gi,
    /\b(X-ray|chest X-ray|radiograph)\b/gi,
    /\b(MRI|CT scan|ultrasound|sonography)\b/gi,
    /\b(blood glucose|fasting glucose|OGTT)\b/gi,
    /\b(serum creatinine|BUN|urea)\b/gi,
  ];
  for (const p of patterns) { (text.match(p) || []).forEach(t => tests.add(t.trim())); }
  return [...tests];
}

function extractNotes(text) {
  if (!text || typeof text !== 'string') return '';
  const patterns = [
    /(?:note|observation|remark|comment)\s*[:\-]\s*([^\n.]{5,200})/i,
    /(?:advice|instruction|recommendation)\s*[:\-]\s*([^\n.]{5,200})/i,
    /(?:allerg(?:y|ies|ic))\s*[:\-]?\s*([^\n.]{3,100})/i,
  ];
  const notes = [];
  for (const p of patterns) { const m = text.match(p); if (m && m[1]) notes.push(m[1].trim()); }
  return notes.slice(0, 2).join('. ');
}

function extractAllergies(text) {
  if (!text || typeof text !== 'string') return [];
  const m = text.match(/allerg(?:y|ies|ic)\s*(?:to)?\s*[:\-]?\s*([^\n.]{3,100})/i);
  return m && m[1] ? [m[1].trim()] : [];
}

function extractVisitDate(text) {
  if (!text || typeof text !== 'string') return null;
  const patterns = [
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/,
    /\b(\d{4})[\/\-](\d{2})[\/\-](\d{2})\b/,
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/i,
    /\b(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/i,
    /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{4})\b/i,
    /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2}),?\s+(\d{4})\b/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) { const d = new Date(m[0]); if (!isNaN(d.getTime())) return d; }
  }
  return null;
}

function buildSummary(condition, testResults, medications) {
  const abnormalCount = Array.isArray(testResults) ? testResults.filter(r => r.isAbnormal).length : 0;
  const medNames = Array.isArray(medications) && medications.length > 0
    ? medications.map(m => (typeof m === 'object' ? m.name : m)).join(', ')
    : 'none recorded';
  return [
    `Visit recorded for: ${condition || 'General Checkup'}.`,
    `${abnormalCount} test value(s) noted outside reference range.`,
    `Medications noted: ${medNames}.`,
    'Review detailed results below for full context.',
  ].join(' ');
}

function detectMedicationIssues(currentMeds, priorMedNames) {
  const duplicates = [];
  const conflicts = [];
  const currentNames = currentMeds.map(m => (typeof m === 'object' ? m.name : m).toLowerCase().trim());
  const priorSet = new Set(priorMedNames.map(n => n.toLowerCase().trim()));
  for (const name of currentNames) { if (priorSet.has(name)) duplicates.push(name); }
  const allMeds = [...new Set([...currentNames, ...priorSet])];
  for (const pair of CONFLICT_PAIRS) {
    const found = pair.drugs.filter(d => allMeds.some(m => m.includes(d)));
    if (found.length >= 2) conflicts.push(pair.note);
  }
  return { duplicates, conflicts };
}

function analyzeHealthTrends(currentResults, priorResults) {
  if (!Array.isArray(priorResults) || priorResults.length === 0) {
    return { increasing: [], decreasing: [], stable: [], summary: 'Insufficient history for trend analysis.' };
  }
  const increasing = [], decreasing = [], stable = [];
  for (const curr of currentResults) {
    const prior = priorResults.find(p => p.parameter === curr.parameter);
    if (!prior) continue;
    const currVal = parseFloat(curr.value), priorVal = parseFloat(prior.value);
    if (isNaN(currVal) || isNaN(priorVal)) continue;
    const diff = ((currVal - priorVal) / priorVal) * 100;
    if (diff > 5) increasing.push(curr.parameter);
    else if (diff < -5) decreasing.push(curr.parameter);
    else stable.push(curr.parameter);
  }
  const parts = [];
  if (increasing.length) parts.push(`${increasing.join(', ')} trending upward`);
  if (decreasing.length) parts.push(`${decreasing.join(', ')} trending downward`);
  if (stable.length) parts.push(`${stable.join(', ')} stable`);
  return { increasing, decreasing, stable, summary: parts.length ? parts.join('; ') + '.' : 'Values appear stable compared to prior visit.' };
}

function suggestFollowUp(condition, abnormalCount) {
  if (abnormalCount >= 3) return 'Review in 3–5 days.';
  if (abnormalCount >= 1) return 'Review in 7–14 days.';
  if (/diabetes|hypertension|cardiac|renal|liver/i.test(condition)) return 'Review in 30 days.';
  return 'Routine follow-up in 3 months.';
}

function assessTreatmentEffectiveness(currentCondition, priorRecords) {
  if (!Array.isArray(priorRecords) || priorRecords.length === 0) {
    return { summary: 'No prior history available for effectiveness assessment.', ineffective: [] };
  }
  const repeated = priorRecords.filter(r => r.condition && r.condition.toLowerCase() === currentCondition.toLowerCase());
  if (repeated.length >= 2) {
    return { summary: `${currentCondition} has been recorded in ${repeated.length + 1} visits. Current treatment may warrant review.`, ineffective: [currentCondition] };
  }
  return { summary: 'Treatment history does not indicate repeated ineffective patterns.', ineffective: [] };
}

// ── NEW ADVANCED FEATURES ─────────────────────────────────────

function buildDoctorDecisionSnapshot(condition, testResults, priorRecords) {
  const abnormal = testResults.filter(r => r.isAbnormal).map(r => r.parameter);
  const recentConditions = priorRecords.slice(0, 3).map(r => r.condition).filter(Boolean);
  const pattern = recentConditions.length > 0
    ? `Recent visits: ${recentConditions.join(' → ')}`
    : 'First recorded visit.';
  const quickNote = abnormal.length > 0
    ? `Attention needed: ${abnormal.join(', ')}.`
    : 'No critical values flagged in this visit.';
  return { recent_pattern: pattern, quick_note: quickNote };
}

function assessPatientReliability(priorRecords) {
  const total = priorRecords.length;
  if (total === 0) return { reliability_level: 'Unknown', reasons: ['No prior visit history available.'] };
  const reasons = [];
  let score = 100;
  const conditions = priorRecords.map(r => r.condition).filter(Boolean);
  const uniqueConditions = new Set(conditions);
  if (conditions.length > uniqueConditions.size * 1.5) {
    score -= 20;
    reasons.push('Recurring conditions suggest inconsistent follow-through.');
  }
  if (total >= 5) { score += 10; reasons.push('Regular visit history noted.'); }
  const level = score >= 80 ? 'Good' : score >= 60 ? 'Moderate' : 'Needs Attention';
  return { reliability_level: level, reasons: reasons.length ? reasons : ['Visit pattern appears consistent.'] };
}

function buildCaseSheet(condition, medications, testResults, notes, allergies, priorRecords) {
  const medNames = medications.map(m => (typeof m === 'object' ? m.name : m));
  const abnormal = testResults.filter(r => r.isAbnormal).map(r => `${r.parameter}: ${r.value}`);
  const history = priorRecords.slice(0, 3).map(r => r.condition).filter(Boolean);
  const parts = [
    `Condition: ${condition}.`,
    medNames.length ? `Medications: ${medNames.join(', ')}.` : '',
    abnormal.length ? `Abnormal findings: ${abnormal.join(', ')}.` : '',
    allergies.length ? `Allergies: ${allergies.join(', ')}.` : '',
    history.length ? `Prior conditions: ${history.join(', ')}.` : '',
    notes ? `Notes: ${notes}.` : '',
  ].filter(Boolean);
  return { case_summary: parts.join(' ') };
}

function estimateTreatmentDuration(condition, priorRecords) {
  const related = priorRecords.filter(r => r.condition && r.condition.toLowerCase().includes(condition.toLowerCase().split(' ')[0]));
  if (related.length === 0) return { duration_summary: 'First recorded occurrence of this condition.' };
  const dates = related.map(r => new Date(r.createdAt)).filter(d => !isNaN(d));
  if (dates.length < 2) return { duration_summary: `Condition noted in ${related.length} prior visit(s).` };
  const oldest = new Date(Math.min(...dates));
  const months = Math.round((Date.now() - oldest) / (1000 * 60 * 60 * 24 * 30));
  return { duration_summary: `${condition} has been tracked for approximately ${months} month(s) across ${related.length + 1} visits.` };
}

function mapSymptomsTreatments(text, medications) {
  const mappings = [];
  const symptomPatterns = [
    { symptom: /fever|pyrexia/i, treatment: 'Antipyretics' },
    { symptom: /pain|ache/i, treatment: 'Analgesics' },
    { symptom: /infection|bacterial/i, treatment: 'Antibiotics' },
    { symptom: /hypertension|high blood pressure/i, treatment: 'Antihypertensives' },
    { symptom: /diabetes|hyperglycemia/i, treatment: 'Antidiabetics' },
    { symptom: /cholesterol|lipid/i, treatment: 'Statins/Lipid-lowering agents' },
    { symptom: /anxiety|depression/i, treatment: 'Psychotropics' },
    { symptom: /asthma|wheez/i, treatment: 'Bronchodilators' },
  ];
  for (const { symptom, treatment } of symptomPatterns) {
    if (symptom.test(text)) {
      const matched = medications.find(m => {
        const name = (typeof m === 'object' ? m.name : m).toLowerCase();
        return treatment.toLowerCase().split('/').some(t => name.includes(t.split(' ')[0].toLowerCase()));
      });
      mappings.push({ symptom: symptom.source.replace(/[\/\\^$*+?.()|[\]{}]/g, '').replace('|', '/'), suggested_treatment: treatment, prescribed: matched ? (typeof matched === 'object' ? matched.name : matched) : 'Not specified' });
    }
  }
  return { mappings };
}

function analyzeHospitalVisitPattern(priorRecords) {
  if (priorRecords.length < 2) return { hospital_pattern_summary: 'Insufficient visit history for pattern analysis.' };
  const dates = priorRecords.map(r => new Date(r.createdAt)).filter(d => !isNaN(d)).sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < dates.length; i++) {
    gaps.push(Math.round((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)));
  }
  const avgGap = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  const freq = avgGap < 30 ? 'frequent (monthly or more)' : avgGap < 90 ? 'regular (every 1–3 months)' : 'infrequent (quarterly or less)';
  return { hospital_pattern_summary: `Patient visits are ${freq}. Average interval: ${avgGap} days across ${priorRecords.length} recorded visits.` };
}

function estimateExpense(tests, medications) {
  const testCost = tests.length * 350;
  const medCost = medications.length * 200;
  const consultCost = 500;
  const total = testCost + medCost + consultCost;
  return { estimated_cost_summary: `Estimated visit cost: ₹${total} (consultation ₹${consultCost}, tests ₹${testCost}, medications ₹${medCost}). Actual costs may vary.` };
}

function computeRiskIndicator(testResults, condition, priorRecords) {
  const abnormalCount = testResults.filter(r => r.isAbnormal).length;
  const isChronicCondition = /diabetes|hypertension|cardiac|renal|liver|cancer/i.test(condition);
  const repeatedCondition = priorRecords.filter(r => r.condition === condition).length >= 2;
  let level = 'Low';
  if (abnormalCount >= 3 || (isChronicCondition && repeatedCondition)) level = 'High';
  else if (abnormalCount >= 1 || isChronicCondition || repeatedCondition) level = 'Moderate';
  return { attention_level: level };
}

function groupVisits(priorRecords, currentCondition, currentDate) {
  const allVisits = [
    { date: currentDate ? currentDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0], condition: currentCondition },
    ...priorRecords.map(r => ({ date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : '', condition: r.condition || 'Unknown' })),
  ];
  const groups = {};
  for (const v of allVisits) {
    const key = v.condition || 'Unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(v.date);
  }
  const grouped_visits = Object.entries(groups).map(([condition, dates]) => ({ condition, visit_count: dates.length, dates }));
  return { grouped_visits };
}

function generatePatientQuestions(condition, testResults) {
  const questions = [
    'What does this diagnosis mean for my daily life?',
    'Are there any lifestyle changes I should make?',
    'How long will I need to take these medications?',
    'When should I come back for a follow-up?',
  ];
  const abnormal = testResults.filter(r => r.isAbnormal);
  for (const r of abnormal.slice(0, 2)) {
    questions.push(`My ${r.parameter} is ${r.isAbnormal ? 'outside normal range' : 'normal'} — what does that mean?`);
  }
  if (/diabetes|glucose/i.test(condition)) questions.push('What diet should I follow for my blood sugar?');
  if (/hypertension|pressure/i.test(condition)) questions.push('How can I monitor my blood pressure at home?');
  return { suggested_questions: questions.slice(0, 6) };
}

// ── Main orchestrator ─────────────────────────────────────────
async function parseStructured(rawText, userId) {
  const defaults = { condition: 'General Checkup', medications: [], dosage: [], testResults: [], visitDate: null, summary: '', insights: [], clinicalAnalysis: null };
  try {
    const text = typeof rawText === 'string' ? rawText : '';
    const condition = extractCondition(text);
    const medicationObjects = extractMedicationsWithDosage(text);
    const medicationNames = medicationObjects.map(m => m.name);
    const dosage = medicationObjects.map(m => m.dosage).filter(Boolean);
    const visitDate = extractVisitDate(text);
    const testResults = extractKeyValues(text);
    const tests = extractTests(text);
    const notes = extractNotes(text);
    const allergies = extractAllergies(text);
    const summary = buildSummary(condition, testResults, medicationNames);
    const abnormalCount = testResults.filter(r => r.isAbnormal).length;

    let priorRecords = [];
    if (userId) {
      try { priorRecords = await ExtractedData.find({ userId }).sort({ createdAt: -1 }).lean(); } catch (e) {}
    }

    const priorMedNames = priorRecords.flatMap(r => (r.medications || []).map(m => (typeof m === 'object' ? m.name : m)));
    const priorTestResults = priorRecords.length > 0 ? (priorRecords[0].testResults || []) : [];

    const { duplicates, conflicts } = detectMedicationIssues(medicationObjects, priorMedNames);
    const trends = analyzeHealthTrends(testResults, priorTestResults);
    const followUp = suggestFollowUp(condition, abnormalCount);
    const effectiveness = assessTreatmentEffectiveness(condition, priorRecords);

    const insights = [
      ...duplicates.map(d => ({ type: 'duplicate_medication', message: `${d} has appeared in a previous report.` })),
      ...conflicts.map(c => ({ type: 'dosage_note', message: c })),
    ];

    const clinicalAnalysis = {
      structured_data: {
        condition, medications: medicationObjects, tests,
        test_results: Object.fromEntries(testResults.map(r => [r.parameter, `${r.value} ${r.unit || ''}`.trim()])),
        visit_date: visitDate ? visitDate.toISOString().split('T')[0] : '',
        notes,
      },
      summary,
      timeline_entry: {
        date: visitDate ? visitDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        condition,
        treatment: medicationNames.join(', ') || 'Not specified',
        visit_type: priorRecords.length === 0 ? 'Initial Visit' : 'Follow-up',
      },
      medication_analysis: {
        duplicate_medications: duplicates,
        potential_conflicts: conflicts,
        notes: duplicates.length || conflicts.length ? 'Review noted items with the prescribing clinician.' : 'No issues detected.',
      },
      treatment_effectiveness: { effectiveness_summary: effectiveness.summary, ineffective_treatments: effectiveness.ineffective },
      health_trends: { increasing_metrics: trends.increasing, decreasing_metrics: trends.decreasing, stable_metrics: trends.stable, short_summary: trends.summary },
      health_profile: {
        frequent_conditions: [...new Set(priorRecords.map(r => r.condition).filter(Boolean))].slice(0, 5),
        recurring_patterns: priorRecords.length >= 3 ? 'Multiple visits recorded — review for chronic patterns.' : 'Insufficient history for pattern detection.',
      },
      follow_up: { recommendation: followUp },
      emergency_summary: {
        critical_conditions: testResults.filter(r => r.isAbnormal).map(r => `${r.parameter}: ${r.value} ${r.unit || ''}`),
        allergies,
        ongoing_medications: medicationNames,
      },
      // ── Advanced features ──
      doctor_decision_snapshot: buildDoctorDecisionSnapshot(condition, testResults, priorRecords),
      patient_reliability: assessPatientReliability(priorRecords),
      case_sheet: buildCaseSheet(condition, medicationObjects, testResults, notes, allergies, priorRecords),
      treatment_duration: estimateTreatmentDuration(condition, priorRecords),
      symptom_treatment_mapping: mapSymptomsTreatments(text, medicationObjects),
      hospital_visit_pattern: analyzeHospitalVisitPattern(priorRecords),
      expense_estimate: estimateExpense(tests, medicationObjects),
      risk_indicator: computeRiskIndicator(testResults, condition, priorRecords),
      visit_grouping: groupVisits(priorRecords, condition, visitDate),
      patient_questions: generatePatientQuestions(condition, testResults),
    };

    return { condition, medications: medicationNames, dosage, testResults, visitDate, summary, insights, clinicalAnalysis };
  } catch (err) {
    console.error('parseStructured error:', err.message);
    return defaults;
  }
}

module.exports = {
  extractCondition, extractMedicationsWithDosage, extractTests, extractNotes, extractVisitDate, buildSummary,
  generateInsights: async (medications, userId) => {
    const names = medications.map(m => (typeof m === 'object' ? m.name : m));
    const { duplicates } = detectMedicationIssues(names.map(n => ({ name: n })), []);
    return duplicates.map(d => ({ type: 'duplicate_medication', message: `${d} has appeared in a previous report.` }));
  },
  parseStructured,
};
