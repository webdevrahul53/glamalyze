// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAM6CqCRdefkRnNBbbWraxrLcW41R4V3mg",
  authDomain: "social-a1170.firebaseapp.com",
  projectId: "social-a1170",
  storageBucket: "social-a1170.appspot.com",
  messagingSenderId: "227955752589",
  appId: "1:227955752589:web:850f11394b622819996cc4",
  measurementId: "G-NRKYXENNBK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const imageDb = getStorage(app);
// const auth = getAuth(app)
// const provider = new GoogleAuthProvider();
export { imageDb}