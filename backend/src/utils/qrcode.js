const QRCode = require('qrcode');

// Hasilkan QR code PNG buffer dari payload JSON.
async function generateQRBuffer(payload) {
  return await QRCode.toBuffer(JSON.stringify(payload), {
    type: 'png',
    width: 400,
    margin: 2,
    color: { dark: '#1C1A14', light: '#FFFFFF' },
  });
}

module.exports = { generateQRBuffer };
