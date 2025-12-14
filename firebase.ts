
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// 1. Keys are configured
const firebaseConfig = {
  apiKey: "AIzaSyAmN2crLnKWFsPPyjXHNE7_HMWCNw41fT8",
  authDomain: "society-hub1.firebaseapp.com",
  projectId: "society-hub1",
  storageBucket: "society-hub1.firebasestorage.app",
  messagingSenderId: "736743120788",
  appId: "1:736743120788:web:fce59eb3e3268e47197981",
  measurementId: "G-0BPZP2CF35"
};

// 2. Initialize the App
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// 3. Export the Auth, Database, and Storage services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();

// 4. This flag tells the rest of your app that we are ready to go!
export const isFirebaseConfigured = true;
