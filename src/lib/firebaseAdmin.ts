import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function getFirebaseAdminApp() {
  if (!getApps().length) {
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    return getApp();
  }
}

const firebaseAdminApp = getFirebaseAdminApp();
const adminAuth = getAuth(firebaseAdminApp);
const adminFirestore = getFirestore(firebaseAdminApp);

export { adminAuth, adminFirestore };
