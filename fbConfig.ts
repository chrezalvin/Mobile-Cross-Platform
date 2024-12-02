// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCodJ0fnG51uzA1WO0EFJ8olyUeY68fCPs",
  authDomain: "chrez-bot.firebaseapp.com",
  databaseURL: "https://chrez-bot-default-rtdb.firebaseio.com",
  projectId: "chrez-bot",
  storageBucket: "chrez-bot.appspot.com",
  messagingSenderId: "288974950371",
  appId: "1:288974950371:web:b416b5db090458c48f5ad6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const firestoreDB = getFirestore(app);

export const storage = getStorage(app);