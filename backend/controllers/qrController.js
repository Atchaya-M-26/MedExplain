const QRCode = require('qrcode');

const generateQR = async (req, res) => {
  try {
    const { patientId } = req.params;
    const url = `${process.env.APP_URL || 'http://localhost:3000'}/doctor/patient/${patientId}`;
    const base64String = await QRCode.toDataURL(url);
    res.json({ success: true, qr: base64String, url });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate QR code' });
  }
};

module.exports = { generateQR };
