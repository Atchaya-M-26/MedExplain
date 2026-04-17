const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

async function sendReportNotification(toEmail, patientName, reportName, analysis) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email not configured — skipping');
    return;
  }
  if (!toEmail) return;

  const condition = analysis?.clinicalAnalysis?.structured_data?.condition || 'General Checkup';
  const abnormalCount = (analysis?.testResults || []).filter(r => r.isAbnormal).length;
  const followUp = analysis?.clinicalAnalysis?.follow_up?.recommendation || 'Consult your doctor.';
  const medications = (analysis?.medications || []).join(', ') || 'None recorded';
  const riskLevel = analysis?.clinicalAnalysis?.risk_indicator?.attention_level || 'Low';
  const riskColor = { High: '#e53e3e', Moderate: '#d69e2e', Low: '#38a169' }[riskLevel] || '#718096';
  const questions = analysis?.clinicalAnalysis?.patient_questions?.suggested_questions?.slice(0, 3) || [];

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f8f9fa;margin:0;padding:0}
.wrap{max-width:580px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
.hdr{background:#4a90a4;padding:24px 28px}
.hdr h1{color:#fff;margin:0;font-size:1.2rem;font-weight:700}
.hdr p{color:#cce8f0;margin:4px 0 0;font-size:.82rem}
.bdy{padding:24px 28px}
.row{margin-bottom:16px}
.lbl{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#718096;margin-bottom:3px}
.val{font-size:.92rem;color:#2d3748;font-weight:500}
.badge{display:inline-block;padding:3px 10px;border-radius:10px;font-size:.72rem;font-weight:700}
.fu{background:#e8f4f8;border-left:4px solid #4a90a4;border-radius:0 8px 8px 0;padding:12px 16px;margin:16px 0}
.divider{border:none;border-top:1px solid #e9ecef;margin:18px 0}
.ftr{background:#f8f9fa;padding:14px 28px;font-size:.72rem;color:#a0aec0;border-top:1px solid #e9ecef}
ul{margin:6px 0 0;padding-left:18px}
ul li{font-size:.82rem;color:#4a5568;margin-bottom:4px}
</style></head>
<body>
<div class="wrap">
  <div class="hdr"><h1>MedExplain</h1><p>Your medical report has been processed</p></div>
  <div class="bdy">
    <p style="font-size:.95rem;color:#2d3748;margin:0 0 16px">Hello <strong>${patientName}</strong>,</p>
    <p style="font-size:.875rem;color:#718096;margin:0 0 20px">Your report <strong>"${reportName}"</strong> has been analysed and is ready to view in your dashboard.</p>
    <div class="row"><div class="lbl">Condition / Diagnosis</div><div class="val">${condition}</div></div>
    <div class="row">
      <div class="lbl">Test Results</div>
      <div class="val">${abnormalCount > 0
        ? `<span class="badge" style="background:#fde8e8;color:#9b1c1c;">&#9888; ${abnormalCount} value(s) outside normal range</span>`
        : `<span class="badge" style="background:#def7ec;color:#03543f;">&#10003; All values within normal range</span>`}</div>
    </div>
    <div class="row">
      <div class="lbl">Risk Level</div>
      <div class="val"><span class="badge" style="background:${riskColor}22;color:${riskColor}">${riskLevel} Attention</span></div>
    </div>
    <div class="row"><div class="lbl">Medications Noted</div><div class="val">${medications}</div></div>
    <div class="fu"><div class="lbl">Follow-up Recommendation</div><div class="val" style="margin-top:4px">${followUp}</div></div>
    ${questions.length > 0 ? `<div class="row"><div class="lbl">Questions to ask your doctor</div><ul>${questions.map(q => `<li>${q}</li>`).join('')}</ul></div>` : ''}
    <hr class="divider">
    <p style="font-size:.82rem;color:#718096;margin:0">Log in to <strong>MedExplain</strong> to view the full report, detailed results, insights, and your health timeline.</p>
  </div>
  <div class="ftr">Sent to your registered email. Not medical advice.</div>
</div>
</body></html>`;

  try {
    const info = await getTransporter().sendMail({
      from: `MedExplain <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Report Ready: ${reportName} — MedExplain`,
      html,
    });
    console.log(`Email sent to ${toEmail} (${info.messageId})`);
  } catch (err) {
    console.error(`Email failed for ${toEmail}:`, err.message);
  }
}

module.exports = { sendReportNotification, sendWelcomeEmail, sendBulkAnnouncement, sendPasswordResetEmail };

async function sendWelcomeEmail(toEmail, userName) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email not configured — skipping welcome email');
    return;
  }
  if (!toEmail) return;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f8f9fa;margin:0;padding:0}
.wrap{max-width:580px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
.hdr{background:linear-gradient(135deg, #3498db 0%, #2980b9 100%);padding:24px 28px}
.hdr h1{color:#fff;margin:0;font-size:1.2rem;font-weight:700}
.hdr p{color:#cce8f0;margin:4px 0 0;font-size:.82rem}
.bdy{padding:24px 28px}
.row{margin-bottom:16px}
.cta{display:inline-block;background:#3498db;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:.9rem}
.divider{border:none;border-top:1px solid #e9ecef;margin:18px 0}
.ftr{background:#f8f9fa;padding:14px 28px;font-size:.72rem;color:#a0aec0;border-top:1px solid #e9ecef}
ul{margin:6px 0 0;padding-left:18px}
ul li{font-size:.82rem;color:#4a5568;margin-bottom:8px}
</style></head>
<body>
<div class="wrap">
  <div class="hdr"><h1>Welcome to MedExplain!</h1><p>Your secure medical record system</p></div>
  <div class="bdy">
    <p style="font-size:.95rem;color:#2d3748;margin:0 0 16px">Hello <strong>${userName}</strong>,</p>
    <p style="font-size:.875rem;color:#718096;margin:0 0 20px">Welcome to MedExplain! We're excited to have you on board. Your account has been created successfully.</p>
    
    <h3 style="font-size:1rem;color:#2d3748;margin:16px 0 12px">Getting Started:</h3>
    <ul>
      <li><strong>Upload Reports:</strong> Start by uploading your medical reports (prescriptions, lab results, imaging, etc.)</li>
      <li><strong>AI Analysis:</strong> Our intelligent system will extract and organize key information automatically</li>
      <li><strong>Secure Sharing:</strong> Share your records securely with healthcare providers when needed</li>
      <li><strong>Health Timeline:</strong> View your complete medical history in an organized timeline</li>
    </ul>
    
    <div style="background:#e8f4f8;border-left:4px solid #3498db;border-radius:0 8px 8px 0;padding:12px 16px;margin:20px 0">
      <p style="margin:0;font-size:.82rem;color:#2c5aa0"><strong>Tips:</strong> Start with your most recent medical reports for better health insights. You can upload documents in PDF, JPG, or PNG formats.</p>
    </div>
    
    <div style="text-align:center;margin:24px 0">
      <a href="http://localhost:3000/dashboard" class="cta">Get Started – Go to Dashboard</a>
    </div>
    
    <hr class="divider">
    <p style="font-size:.82rem;color:#718096;margin:0">If you have any questions or need support, feel free to reach out to our team. We're here to help you manage your health data securely.</p>
  </div>
  <div class="ftr">Welcome email from MedExplain. Keep your medical records organized and secure.</div>
</div>
</body></html>`;

  try {
    const info = await getTransporter().sendMail({
      from: `MedExplain <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Welcome to MedExplain — Your Medical Records System',
      html,
    });
    console.log(`✅ Welcome email sent to ${toEmail} (${info.messageId})`);
  } catch (err) {
    console.error(`❌ Welcome email failed for ${toEmail}:`, err.message);
  }
}

async function sendPasswordResetEmail(toEmail, resetLink) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email not configured — skipping password reset email');
    return;
  }
  if (!toEmail) return;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f8f9fa;margin:0;padding:0}
.wrap{max-width:580px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
.hdr{background:linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);padding:24px 28px}
.hdr h1{color:#fff;margin:0;font-size:1.2rem;font-weight:700}
.bdy{padding:24px 28px}
.cta{display:inline-block;background:#e74c3c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:.9rem}
.warning{background:#fff3cd;border-left:4px solid #ffc107;border-radius:0 8px 8px 0;padding:12px 16px;margin:20px 0}
.divider{border:none;border-top:1px solid #e9ecef;margin:18px 0}
.ftr{background:#f8f9fa;padding:14px 28px;font-size:.72rem;color:#a0aec0;border-top:1px solid #e9ecef}
</style></head>
<body>
<div class="wrap">
  <div class="hdr"><h1>Reset Your Password</h1></div>
  <div class="bdy">
    <p style="font-size:.95rem;color:#2d3748;margin:0 0 16px">Hi,</p>
    <p style="font-size:.875rem;color:#718096;margin:0 0 20px">You requested to reset your password on MedExplain. Click the button below to create a new password:</p>
    
    <div style="text-align:center;margin:28px 0">
      <a href="${resetLink}" class="cta">Reset Password</a>
    </div>
    
    <p style="font-size:.82rem;color:#718096;margin:0 0 12px">Or copy and paste this link in your browser:</p>
    <p style="font-size:.75rem;color:#718096;word-break:break-all;margin:0 0 20px;background:#f5f5f5;padding:10px;border-radius:4px">${resetLink}</p>
    
    <div class="warning">
      <strong>⏰ Important:</strong> This link will expire in 1 hour for security reasons.
    </div>
    
    <hr class="divider">
    <p style="font-size:.82rem;color:#718096;margin:0">If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
  </div>
  <div class="ftr">MedExplain Password Reset Email</div>
</div>
</body></html>`;

  try {
    const info = await getTransporter().sendMail({
      from: `MedExplain <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Reset Your MedExplain Password',
      html,
    });
    console.log(`✅ Password reset email sent to ${toEmail} (${info.messageId})`);
  } catch (err) {
    console.error(`❌ Password reset email failed for ${toEmail}:`, err.message);
  }
}

async function sendBulkAnnouncement(subject, htmlContent, recipientEmails = []) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email not configured — skipping bulk announcement');
    return { success: false, error: 'Email not configured' };
  }

  if (!recipientEmails.length) {
    console.log('No recipients for announcement');
    return { success: false, error: 'No recipients' };
  }

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f8f9fa;margin:0;padding:0}
.wrap{max-width:580px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}
.hdr{background:linear-gradient(135deg, #3498db 0%, #2980b9 100%);padding:24px 28px}
.hdr h1{color:#fff;margin:0;font-size:1.2rem;font-weight:700}
.bdy{padding:24px 28px}
.divider{border:none;border-top:1px solid #e9ecef;margin:18px 0}
.ftr{background:#f8f9fa;padding:14px 28px;font-size:.72rem;color:#a0aec0;border-top:1px solid #e9ecef}
</style></head>
<body>
<div class="wrap">
  <div class="hdr"><h1>📢 Announcement from MedExplain</h1></div>
  <div class="bdy">
    ${htmlContent}
  </div>
  <div class="ftr">MedExplain Community Announcement</div>
</div>
</body></html>`;

  let successCount = 0;
  let failCount = 0;

  for (const email of recipientEmails) {
    try {
      const info = await getTransporter().sendMail({
        from: `MedExplain <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `📢 ${subject}`,
        html,
      });
      successCount++;
      console.log(`✅ Announcement sent to ${email} (${info.messageId})`);
    } catch (err) {
      failCount++;
      console.error(`❌ Announcement failed for ${email}:`, err.message);
    }
  }

  return { success: true, sent: successCount, failed: failCount };
}
