/**
 * Post-Deploy IndexNow Selective Submission Script
 * Notifies Bing & IndexNow about updated/new URLs.
 */
const https = require('https');

const payload = JSON.stringify({
  host: 'numvax.com',
  key: 'e8f9210c47b34b6289d0f5e123456789',
  keyLocation: 'https://numvax.com/e8f9210c47b34b6289d0f5e123456789.txt',
  urlList: [
    'https://numvax.com/',
    'https://numvax.com/tools',
    'https://numvax.com/about',
    'https://numvax.com/bulk-image-compressor',
    'https://numvax.com/bulk-qr-code-generator',
    'https://numvax.com/image-compressor',
    'https://numvax.com/qr-code-generator',
    'https://numvax.com/merge-pdf',
    'https://numvax.com/pdf-to-word',
    'https://numvax.com/word-counter'
  ]
});

const options = {
  hostname: 'api.indexnow.org',
  port: 443,
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  console.log(`IndexNow Submission Response: ${res.statusCode}`);
  res.on('data', (d) => process.stdout.write(d));
});

req.on('error', (error) => {
  console.error('IndexNow Submission Error:', error);
});

req.write(payload);
req.end();
