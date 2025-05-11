import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCmnUx_XJ3Cs3ZC22fByuwHFlLDPFCdrN8",
  authDomain: "restapart-2ee2c.firebaseapp.com",
  projectId: "restapart-2ee2c",
  storageBucket: "restapart-2ee2c.appspot.com",
  messagingSenderId: "218388868680",
  appId: "1:218388868680:web:7405ad32816efff575b27d",
  measurementId: "G-ELTC62P6JD"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

