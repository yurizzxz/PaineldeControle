import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  DocumentReference
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbWio8rerVcId4k3WGDhrKuahOj2t2v9I",
  authDomain: "app-fitfusion.firebaseapp.com",
  projectId: "app-fitfusion",
  storageBucket: "app-fitfusion.appspot.com",
  messagingSenderId: "61815565821",
  appId: "1:61815565821:web:52334725ccd5c6896bbd94",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, doc, deleteDoc, updateDoc, getDocs, DocumentReference };
