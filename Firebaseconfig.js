
const admin = require('firebase-admin');

// Option 1: Using service account key file (recommended for production)
const serviceAccount = require('./otpverification-4d1f9-99f6acdb4f50.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
