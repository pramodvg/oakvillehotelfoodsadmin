// Firebase Configuration
// Replace these values with your own Firebase project config
// from Firebase Console > Project Settings > General > Your apps > Firebase SDK snippet

const firebaseConfig = {
  apiKey: "AIzaSyAqcI1iFjK3_yaWMp2SB59YQIpvOi0do1A",
  authDomain: "diamondwebsite-13059.firebaseapp.com",
  databaseURL: "https://diamondwebsite-13059-default-rtdb.firebaseio.com",
  projectId: "diamondwebsite-13059",
  storageBucket: "diamondwebsite-13059.firebasestorage.app",
  messagingSenderId: "474494323397",
  appId: "1:474494323397:web:e741159fc80f66417b3eac",
  measurementId: "G-QW9W741G7M"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Realtime Database
const database = firebase.database();
