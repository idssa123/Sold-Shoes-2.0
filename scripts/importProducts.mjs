import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { products } from '../src/data/products.js';

const cfg = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(cfg).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error('Faltan variables de entorno de Firebase:', missing.join(', '));
  console.error('Crea un archivo .env con las claves o exportalas antes de ejecutar este script.');
  process.exit(1);
}

const app = initializeApp(cfg);
const db = getFirestore(app);

async function importAll() {
  console.log(`Importando ${products.length} productos a Firestore (colección 'products')...`);
  let success = 0;
  for (const p of products) {
    try {
      const ref = doc(collection(db, 'products'), p.id);
      await setDoc(ref, p);
      success++;
      console.log(`+ ${p.id}`);
    } catch (err) {
      console.error(`Error al subir ${p.id}:`, err.message || err);
    }
  }
  console.log(`Import completado: ${success}/${products.length} subidos.`);
}

importAll().catch((e) => {
  console.error('Import fallo:', e);
  process.exit(1);
});
