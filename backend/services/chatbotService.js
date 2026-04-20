/**
 * Context-aware medical chatbot service.
 * Uses structured report data to answer patient questions.
 * Supports English, Tamil, Hindi.
 * Does NOT diagnose or prescribe.
 */

const MEDICAL_TERMS = {
  hypertension: 'high blood pressure',
  hyperglycemia: 'high blood sugar',
  hypoglycemia: 'low blood sugar',
  tachycardia: 'fast heart rate',
  bradycardia: 'slow heart rate',
  arrhythmia: 'irregular heart rhythm',
  dyspnea: 'shortness of breath',
  hemoglobin: 'oxygen-carrying protein in blood',
  erythrocytes: 'red blood cells',
  leukocytes: 'white blood cells',
  platelets: 'cells that help blood clot',
  hematocrit: 'percentage of red blood cells in blood',
  bilirubin: 'pigment from broken-down blood cells',
  creatinine: 'waste product filtered by kidneys',
  triglycerides: 'type of fat in blood',
  cholesterol: 'fatty substance in blood',
  ldl: 'bad cholesterol',
  hdl: 'good cholesterol',
  edema: 'swelling caused by fluid buildup',
  fibrosis: 'scarring of tissue',
  benign: 'non-cancerous',
  malignant: 'cancerous',
  systolic: 'upper number in blood pressure reading',
  diastolic: 'lower number in blood pressure reading',
  glucose: 'blood sugar level',
  anemia: 'low red blood cell count causing fatigue',
};

// Simple translations for common phrases
const TRANSLATIONS = {
  ta: {
    'Please consult your doctor for detailed advice.': 'விரிவான ஆலோசனைக்கு உங்கள் மருத்துவரை அணுகவும்.',
    'No data available for this report.': 'இந்த அறிக்கைக்கு தரவு இல்லை.',
    'condition': 'நோய்',
    'medications': 'மருந்துகள்',
    'test results': 'சோதனை முடிவுகள்',
    'normal': 'இயல்பு',
    'abnormal': 'அசாதாரண',
    'follow-up': 'மறு சந்திப்பு',
  },
  hi: {
    'Please consult your doctor for detailed advice.': 'विस्तृत सलाह के लिए अपने डॉक्टर से परामर्श करें।',
    'No data available for this report.': 'इस रिपोर्ट के लिए कोई डेटा उपलब्ध नहीं है।',
    'condition': 'स्थिति',
    'medications': 'दवाइयाँ',
    'test results': 'परीक्षण परिणाम',
    'normal': 'सामान्य',
    'abnormal': 'असामान्य',
    'follow-up': 'अनुवर्ती',
  },
};

function detectIntent(question) {
  const q = question.toLowerCase();
  if (/condition|diagnosis|disease|problem|what.*wrong|what.*have/i.test(q)) return 'condition';
  if (/medication|medicine|drug|tablet|capsule|prescribed|taking/i.test(q)) return 'medications';
  if (/test|result|value|level|report|blood|glucose|pressure|cholesterol|hemoglobin|abnormal|normal/i.test(q)) return 'test_results';
  if (/follow.?up|next.*visit|when.*come|appointment/i.test(q)) return 'followup';
  if (/mean|explain|what.*is|define|understand/i.test(q)) return 'explanation';
  if (/risk|danger|serious|critical|worry|concern/i.test(q)) return 'risk';
  if (/history|previous|before|past|last.*time/i.test(q)) return 'history';
  if (/allerg/i.test(q)) return 'allergies';
  return 'general';
}

function findSimplifiedTerms(text) {
  const found = [];
  const lower = text.toLowerCase();
  for (const [term, meaning] of Object.entries(MEDICAL_TERMS)) {
    if (lower.includes(term)) {
      found.push({ term, meaning });
    }
  }
  return found;
}

function buildResponse(intent, question, structuredData, summary, history) {
  const ca = structuredData?.clinicalAnalysis;
  const sd = ca?.structured_data || {};
  const condition = sd.condition || structuredData?.condition || 'General Checkup';

  // Normalize medications — handle both string[] and {name,dosage}[]
  const rawMeds = sd.medications || structuredData?.medications || [];
  const medications = rawMeds.map(m => typeof m === 'object' ? m : { name: m, dosage: '' });

  // Normalize test results
  const testResults = structuredData?.testResults || [];
  const abnormal = testResults.filter(r => r.isAbnormal);
  const followUp = ca?.follow_up?.recommendation || 'Consult your doctor.';
  const allergies = ca?.emergency_summary?.allergies || [];
  const riskLevel = ca?.risk_indicator?.attention_level || 'Low';

  switch (intent) {
    case 'condition': {
      if (!condition || condition === 'General Checkup') {
        return `Your report has been recorded as a general checkup. No specific condition was identified in the extracted data. ${summary ? 'Summary: ' + summary : ''} Please consult your doctor for a detailed assessment.`;
      }
      return `Your report indicates: ${condition}. ${summary ? summary : ''} Please consult your doctor for a detailed explanation of this condition.`;
    }

    case 'medications': {
      const medList = medications.map(m => `${m.name}${m.dosage ? ' (' + m.dosage + ')' : ''}`);
      if (medList.length === 0) return 'No medications were recorded in this report. Please consult your doctor if you have questions about your prescriptions.';
      return `The following medications were noted in your report: ${medList.join(', ')}. Please follow your doctor\'s instructions for dosage and timing.`;
    }

    case 'test_results': {
      if (testResults.length === 0) return 'No specific test values were extracted from this report. Please consult your doctor for a detailed review.';
      const lines = testResults.map(r => `${r.parameter}: ${r.value} ${r.unit || ''} — ${r.isAbnormal ? 'outside normal range' : 'within normal range'}`);
      const abnormalNote = abnormal.length > 0
        ? ` ${abnormal.length} value(s) are outside the normal range. Please discuss these with your doctor.`
        : ' All extracted values appear within normal range.';
      return `Test results from your report:\n${lines.join('\n')}${abnormalNote}`;
    }

    case 'followup': {
      return `Based on your report, the suggested follow-up is: ${followUp} Please schedule an appointment with your doctor accordingly.`;
    }

    case 'risk': {
      const riskMsg = {
        High: 'Your report shows some values that need prompt attention. Please consult your doctor soon.',
        Moderate: 'Your report shows some values worth monitoring. A follow-up visit is recommended.',
        Low: 'Your report does not indicate any immediate concerns. Continue with routine check-ups.',
      }[riskLevel] || 'Please consult your doctor for a risk assessment.';
      return riskMsg;
    }

    case 'allergies': {
      if (allergies.length === 0) return 'No allergies were recorded in this report. Please inform your doctor of any known allergies.';
      return `Allergies noted in your report: ${allergies.join(', ')}. Always inform your healthcare providers about these.`;
    }

    case 'history': {
      if (!history || history.length === 0) return 'No prior visit history is available. This appears to be your first recorded report.';
      const recent = history.slice(0, 3).map(h => h.condition || 'General Checkup');
      return `Your recent visit history shows: ${recent.join(', ')}. For a complete history, please review your timeline.`;
    }

    case 'explanation': {
      // Try to find the term being asked about
      const q = question.toLowerCase();
      for (const [term, meaning] of Object.entries(MEDICAL_TERMS)) {
        if (q.includes(term)) {
          return `${term.charAt(0).toUpperCase() + term.slice(1)} means: ${meaning}. If this term appears in your report, please discuss its significance with your doctor.`;
        }
      }
      return `I can help explain medical terms from your report. Could you specify which term you'd like explained? For example: "What is hemoglobin?" or "What does hypertension mean?"`;
    }

    default: {
      const parts = [];
      if (condition && condition !== 'General Checkup') parts.push(`Condition: ${condition}`);
      if (abnormal.length > 0) parts.push(`${abnormal.length} test value(s) need attention`);
      if (followUp) parts.push(`Follow-up: ${followUp}`);
      if (parts.length > 0) return `Here's a summary from your report: ${parts.join('. ')}. Please consult your doctor for detailed advice.`;
      return summary || 'Please consult your doctor for detailed advice.';
    }
  }
}

function translateResponse(text, lang) {
  if (!lang || lang === 'en') return text;
  const map = TRANSLATIONS[lang] || {};
  // Apply known phrase translations
  let translated = text;
  for (const [en, local] of Object.entries(map)) {
    translated = translated.replace(new RegExp(en, 'gi'), local);
  }
  return translated;
}

function processChat(question, structuredData, summary, history, language = 'en') {
  if (!question || !question.trim()) {
    return {
      response: 'Please ask a question about your report.',
      original_english: 'Please ask a question about your report.',
      simplified_terms: [],
    };
  }

  const intent = detectIntent(question);
  const englishResponse = buildResponse(intent, question, structuredData, summary, history);
  const simplifiedTerms = findSimplifiedTerms(question + ' ' + englishResponse);
  const finalResponse = translateResponse(englishResponse, language);

  return {
    response: finalResponse,
    original_english: englishResponse,
    simplified_terms: simplifiedTerms,
    intent,
  };
}

module.exports = { processChat };
