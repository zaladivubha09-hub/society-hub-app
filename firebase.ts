
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


// 1. Keys are configured
const firebaseConfig = {
  apiKey: "AIzaSyDpaMl5VJeDgVQsOe_mDgg-AMa6xUCpWwg",
  authDomain: "database-madhav.firebaseapp.com",
  projectId: "database-madhav",
  storageBucket: "database-madhav.firebasestorage.app",
  messagingSenderId: "532474961688",
  appId: "1:532474961688:web:03c959eca51b9a6388486d"
};

// 2. Initialize the App
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


// 3. Export the Auth and Database services so other pages can use them
export const auth = firebase.auth();
export const db = firebase.firestore();

// 4. This flag tells the rest of your app that we are ready to go!
export const isFirebaseConfigured = true;
