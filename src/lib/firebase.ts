import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_Le2SspzMiPtgruGK3QDh1kky3ISk1ps",
  authDomain: "mozflow-d38fa.firebaseapp.com",
  databaseURL: "https://mozflow-d38fa-default-rtdb.firebaseio.com",
  projectId: "mozflow-d38fa",
  storageBucket: "mozflow-d38fa.firebasestorage.app",
  messagingSenderId: "408263222471",
  appId: "1:408263222471:web:b4adc6f887d4386845cae2",
  measurementId: "G-SWMPND8T2D",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);