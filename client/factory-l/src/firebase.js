// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAuf5e9QRWTiBjEgwex3XRAhGvCtxxFyTk",
  authDomain: "dprinthub-5cd8b.firebaseapp.com",
  projectId: "dprinthub-5cd8b",
  storageBucket: "dprinthub-5cd8b.firebasestorage.app",
  messagingSenderId: "643012194221",
  appId: "1:643012194221:web:1a3d9528c027793e05fb24",
  measurementId: "G-ZGKY2Q4481"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

if (typeof window !== "undefined") {
  try {
    getAnalytics(app);
  } catch (error) {
    // Analytics is optional; ignore errors if not supported (e.g., in development)
    console.warn("Firebase analytics initialization skipped:", error);
  }
}

export default app;