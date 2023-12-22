import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

export const firebaseApp = getApps().length == 0 ? initializeApp(FirebaseConfig) : getApps()[0];
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export async function getAuthenticatedAppForUser(session = null) {
    if (typeof window != "undefined") {
        console.log("client: ", firebaseApp);
        return { app: firebaseApp, currentUser: auth.currentUser };
    }

    const { initializeApp: initializeAdminApp, getApps: getAdminApps } = await import("firebase-admin/app");
    const { getAuth: getAdminAuth } = await import("firebase-admin/auth");
    const { credential } = await import("firebase-admin");

    const ADMIN_APP_NAME = "firebase-frameworks";
    const adminApp = getAdminApps().find((it) => it.name == ADMIN_APP_NAME) || initializeAdminApp({credential: credential.applicationDefault()}, ADMIN_APP_NAME);
    const adminAuth = getAdminAuth(adminApp);
    const noSessionReturn = { app: null, currentUser: null };

    if (!session) {
        let session = await getAppRouterSession();
        if (!session) return noSessionReturn;
    }

    const decodedIDToken = await adminAuth.verifySessionCookie(session!);

    const app = initializeAuthenticatedApp(decodedIDToken.uid);
    const auth2 = getAuth(app);

    const isRevoked = !(await adminAuth.verifySessionCookie(session!, true).catch((e) => console.error(e.message)));
    if (isRevoked) return noSessionReturn;

    if (auth2.currentUser?.uid != decodedIDToken.uid) {
        const customToken = await adminAuth.createCustomToken(decodedIDToken.uid).catch((e) => console.error(e.message));
        if (!customToken) return noSessionReturn;
        await signInWithCustomToken(auth2, customToken);
    }

    console.log("Server: ", app);
    return { app, currentUser: auth2.currentUser };
}

async function getAppRouterSession() {
    const { cookies } = await import("next/headers");
    try {
        return cookies().get("__session")?.value;
    }
    catch (error) {
        return undefined;
    }
}

function initializeAuthenticatedApp(uid: string) {
    const random = Math.random().toString(36).split(".")[1];
    const appName = `authenticated-context:${uid}:${random}`;
    const app = initializeApp(FirebaseConfig, appName);
    return app;
}