import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App | undefined;

function initApp() {
  if (app) {
    return app;
  }

  if (!getApps().length) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (projectId && clientEmail && rawPrivateKey) {
      const privateKey = rawPrivateKey.replace(/\\n/g, '\n');
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    } else {
      app = initializeApp();
    }
  } else {
    app = getApps()[0];
  }

  return app!;
}

export const adminApp = initApp();
export const adminDb = getFirestore(adminApp);
