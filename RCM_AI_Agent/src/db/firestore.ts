import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const admin = require('firebase-admin');
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from '../config.js';

// Initialize Firebase Admin

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log("Initializing Firestore using FIREBASE_SERVICE_ACCOUNT env var");
    const cert = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString());
    
    // Fix private key newlines if they are escaped literal \n strings
    if (cert.private_key && typeof cert.private_key === 'string') {
      cert.private_key = cert.private_key.replace(/\\n/g, '\n');
    }

    if (getApps().length === 0) {
      initializeApp({
        credential: admin.credential.cert(cert),
        projectId: cert.project_id
      });
    }
  } else if (config.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log(`Initializing Firestore using credentials at ${config.GOOGLE_APPLICATION_CREDENTIALS}`);
    if (getApps().length === 0) {
       initializeApp({
         projectId: config.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || 'demo-rcm-ai',
       });
    }
  } else {
      console.warn("⚠️ Warning: No Firebase credentials provided. Assuming default fallback.");
      if (getApps().length === 0) {
        initializeApp({
          projectId: config.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || 'demo-rcm-ai',
        });
      }
  }
  console.log("✅ Firestore initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Firestore:", error);
  process.exit(1);
}

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
export { db };