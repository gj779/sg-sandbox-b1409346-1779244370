import * as admin from 'firebase-admin';
import serviceAccount from '../../firebase-service-account.json';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    console.log('Initializing Firebase Admin SDK...');
    
    // Check if service account has the required fields
    if (!serviceAccount || !serviceAccount.project_id || !serviceAccount.private_key) {
      console.error('Service account file is missing required fields. Please check firebase-service-account.json');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
    
    console.log('Firebase Admin SDK initialized successfully');
    
    // Test the connection to Firestore
    const testDb = admin.firestore();
    testDb.collection('_test_connection').doc('_test').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      console.log('Successfully connected to Firestore with Admin SDK');
      // Clean up test document
      testDb.collection('_test_connection').doc('_test').delete();
    }).catch(error => {
      console.error('Failed to write to Firestore with Admin SDK:', error);
    });
    
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    
    // Log more details about the service account (without sensitive info)
    if (serviceAccount) {
      console.log('Service account project_id:', serviceAccount.project_id);
      console.log('Service account client_email:', serviceAccount.client_email);
      console.log('Service account private_key exists:', !!serviceAccount.private_key);
    } else {
      console.error('Service account is undefined or null');
    }
  }
}

export default admin;