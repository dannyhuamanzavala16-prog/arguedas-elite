/**
 * seed-users.mjs
 * Crea usuarios de prueba en Firebase Auth + Firestore via REST API.
 * Uso: node scripts/seed-users.mjs
 */

const API_KEY = 'AIzaSyAcHt2LRsnwpOamJOtSwtakvJMIOuhYpHU';
const PROJECT_ID = 'arguedas-elite';

const USERS = [
  {
    email: 'docente@arguedas.edu.pe',
    password: 'docente',
    role: 'docente',
    nombre: 'Docente Demo',
    username: 'docente',
  },
  {
    email: 'admin@arguedas.edu.pe',
    password: 'admin123',
    role: 'admin',
    nombre: 'Administrador Demo',
    username: 'admin',
  },
  {
    email: 'estudiante@arguedas.edu.pe',
    password: 'estudiante',
    role: 'estudiante',
    nombre: 'Estudiante Demo',
    username: 'estudiante',
  },
];

async function createAuthUser(email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Auth error for ${email}: ${data.error.message}`);
  return { uid: data.localId, idToken: data.idToken };
}

async function signInUser(email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`SignIn error for ${email}: ${data.error.message}`);
  return { uid: data.localId, idToken: data.idToken };
}

async function createFirestoreDoc(uid, idToken, userData) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/usuarios/${uid}?key=${API_KEY}`;

  const fields = {
    username: { stringValue: userData.username },
    role: { stringValue: userData.role },
    nombre: { stringValue: userData.nombre },
    email: { stringValue: userData.email },
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields }),
  });

  const data = await res.json();
  if (data.error) throw new Error(`Firestore error for ${userData.email}: ${data.error.message}`);
  return data;
}

async function main() {
  console.log('🔥 Seeding Firebase users...\n');

  for (const user of USERS) {
    process.stdout.write(`  ⏳ Procesando ${user.email}...`);
    try {
      let uid, idToken;
      try {
        ({ uid, idToken } = await createAuthUser(user.email, user.password));
      } catch (authErr) {
        if (authErr.message.includes('EMAIL_EXISTS')) {
          ({ uid, idToken } = await signInUser(user.email, user.password));
        } else {
          throw authErr;
        }
      }
      await createFirestoreDoc(uid, idToken, user);
      console.log(` ✅ UID: ${uid} | rol: ${user.role}`);
    } catch (err) {
      console.log(` ❌ Error: ${err.message}`);
    }
  }

  console.log('\n✅ Listo. Usuarios disponibles:');
  console.log('   📧 docente@arguedas.edu.pe  | 🔑 docente     | rol: docente');
  console.log('   📧 admin@arguedas.edu.pe    | 🔑 admin123    | rol: admin');
  console.log('   📧 estudiante@arguedas.edu.pe | 🔑 estudiante | rol: estudiante');
}

main();
