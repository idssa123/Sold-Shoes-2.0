import admin from 'firebase-admin';
import fs from 'fs';
import { products } from '../src/data/products.js';

const serviceAccountPath = process.argv[2] || process.env.SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error('No se encontró el archivo de credenciales de servicio en:', serviceAccountPath);
  console.error('Descarga el JSON desde Firebase Console → Project settings → Service accounts → Generate new private key');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importAll() {
  console.log(`Importando ${products.length} productos a Firestore (colección 'products')...`);
  let success = 0;
  for (const p of products) {
    try {
      await db.collection('products').doc(p.id).set({
        ...p,
        stock: p.stock ?? 5,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
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
