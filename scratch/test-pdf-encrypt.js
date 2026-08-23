const crypto = require('crypto');
const { PDFDocument, PDFName, PDFString, PDFHexString, PDFNumber, PDFDict, PDFArray } = require('pdf-lib');

// Standard PDF padding string as specified by Adobe ISO 32000-1
const PADDING = Buffer.from([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41,
  0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
  0x2e, 0x2e, 0x00, 0xb6, 0xd4, 0x50, 0x16, 0x53,
  0x69, 0x01, 0x12, 0x29, 0x2e, 0x60, 0x80, 0x00
]);

function md5(data) {
  return crypto.createHash('md5').update(data).digest();
}

function rc4(key, data) {
  const S = new Uint8Array(256);
  for (let i = 0; i < 256; i++) S[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key[i % key.length]) & 0xff;
    const tmp = S[i]; S[i] = S[j]; S[j] = tmp;
  }
  let i = 0; j = 0;
  const out = Buffer.alloc(data.length);
  for (let k = 0; k < data.length; k++) {
    i = (i + 1) & 0xff;
    j = (j + S[i]) & 0xff;
    const tmp = S[i]; S[i] = S[j]; S[j] = tmp;
    out[k] = data[k] ^ S[(S[i] + S[j]) & 0xff];
  }
  return out;
}

function padPassword(password) {
  const pwdBuf = Buffer.from(password, 'utf8');
  if (pwdBuf.length >= 32) return pwdBuf.slice(0, 32);
  return Buffer.concat([pwdBuf, PADDING.slice(0, 32 - pwdBuf.length)]);
}

// Compute Owner Key (O)
function computeO(userPassword, ownerPassword) {
  const oPad = padPassword(ownerPassword || userPassword);
  let key = md5(oPad).slice(0, 5); // 40-bit key for Rev 2
  const uPad = padPassword(userPassword);
  return rc4(key, uPad);
}

// Compute User Key (U)
function computeU(userPassword, O, P, id) {
  const uPad = padPassword(userPassword);
  const pBuf = Buffer.alloc(4);
  pBuf.writeInt32LE(P, 0); // permissions int
  
  const hashInput = Buffer.concat([uPad, O, pBuf, id]);
  const fileKey = md5(hashInput).slice(0, 5); // 40-bit encryption key
  return { fileKey, U: rc4(fileKey, PADDING) };
}

console.log("PDF Encryption algorithm helper loaded successfully!");
