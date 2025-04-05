
import * as admin from 'firebase-admin';
import serviceAccount from '../../firebase-service-account.json';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

export default admin;
