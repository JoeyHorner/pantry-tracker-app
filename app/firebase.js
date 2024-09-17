import { initializeApp } from 'firebase/app'
import {getFirestore} from 'firebase/firestore'
// https://firebase.google.com/docs/web/setup#available-libraries
//source used for learning hiding keys with dotenv: https://www.youtube.com/watch?v=FcwfjMebjTU by Code with Ania Kubow
import dotenv from 'dotenv'
//Source used to help fix .env variables not loading: https://stackoverflow.com/questions/74443455/typescript-application-not-finding-local-env-file post by Fabian Strathaus
import path from 'path';
import { fileURLToPath } from 'url';
// Define __dirname
const __dirname = path.dirname(new URL(import.meta.url).pathname);
// Load environment variables from .env.local file in the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });


const firebaseConfig = {
  
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
export {app, firestore}