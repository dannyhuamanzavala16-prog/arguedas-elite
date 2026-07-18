/**
 * set-storage-cors.mjs
 * Configura las reglas CORS del bucket de Firebase Storage
 * para permitir solicitudes desde localhost:4200.
 *
 * Uso: node scripts/set-storage-cors.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY = 'AIzaSyAcHt2LRsnwpOamJOtSwtakvJMIOuhYpHU';
const BUCKET = 'arguedas-elite.firebasestorage.app';

async function signIn(email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`SignIn error: ${data.error.message}`);
  return data.idToken;
}

async function main() {
  console.log('🔧 Configurando CORS en Firebase Storage...\n');

  const idToken = await signIn('admin@arguedas.edu.pe', 'admin123');
  console.log('✅ Autenticado\n');

  const corsConfig = [
    {
      origin: [
        'http://localhost:4200',
        'https://arguedas-elite.web.app',
        'https://arguedas-elite.firebaseapp.com',
      ],
      method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
      maxAgeSeconds: 3600,
      responseHeader: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    },
  ];

  // Firebase Storage JSON API – PATCH bucket CORS
  const url = `https://storage.googleapis.com/storage/v1/b/${BUCKET}?fields=cors`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ cors: corsConfig }),
  });

  const json = await res.json();
  
  if (res.ok) {
    console.log('✅ CORS configurado correctamente en el bucket.');
    console.log('   Orígenes permitidos:');
    json.cors?.[0]?.origin?.forEach(o => console.log(`   - ${o}`));
  } else {
    // La Identity Platform token no tiene permisos de admin de Storage.
    // Hay que usar Google OAuth o el Admin SDK.
    console.warn('⚠️  El token de usuario no tiene permisos para modificar CORS del bucket.');
    console.warn('   Usá una de estas alternativas:\n');
    console.warn('   Opción A — Firebase CLI (recomendado):');
    console.warn('     npm install -g firebase-tools');
    console.warn('     firebase login');
    console.warn('     firebase init storage   # genera storage.rules');
    console.warn('     # Luego configurá CORS desde la consola de Google Cloud');
    console.warn('\n   Opción B — Google Cloud Console (sin instalar nada):');
    console.warn('     1. Ir a https://console.cloud.google.com/storage/browser');
    console.warn('     2. Seleccionar el bucket "arguedas-elite.firebasestorage.app"');
    console.warn('     3. Pestaña "Permisos" → "CORS"');
    console.warn('     4. Agregar el archivo cors.json adjunto');
    console.warn('\n   Error original:', json.error?.message ?? JSON.stringify(json));
  }
}

main().catch(console.error);
