import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDBsce5jyMm6cxDLRu1l7ZUOb6pQw9360Q",
  authDomain: "dear-saiya.firebaseapp.com",
  projectId: "dear-saiya",
  storageBucket: "dear-saiya.firebasestorage.app",
  messagingSenderId: "461227786409",
  appId: "1:461227786409:web:0b887c8beba4ec39e629b8",
  measurementId: "G-4G9TKH6B3F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
