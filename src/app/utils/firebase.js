
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBbyJuxuCIY-BwzLPItpQbtegAkAMo755o",
    authDomain: "tangotiempo-257ff.firebaseapp.com",
    projectId: "tangotiempo-257ff",
    storageBucket: "tangotiempo-257ff.appspot.com",
    messagingSenderId: "685681979859",
    appId: "1:685681979859:web:6609aa591ea8917166bf26",
    measurementId: "G-8DED6NXCJ8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
