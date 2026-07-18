/**
 * seed-collections.mjs
 * Puebla Firestore con datos iniciales de estudiantes, docentes y materiales.
 * Uso: node scripts/seed-collections.mjs
 */

const API_KEY = 'AIzaSyAcHt2LRsnwpOamJOtSwtakvJMIOuhYpHU';
const PROJECT_ID = 'arguedas-elite';

// ─── Datos ───────────────────────────────────────────────────────────────────

function daysAgo(n, hoursOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(d.getHours() - hoursOffset);
  return d.toISOString();
}

const ESTUDIANTES = [
  { codigo: '#EA-2024-001', nombre: 'Alejandra Mendoza', email: 'alejandra.m@elite.edu', salon: 'Aula 402 - B', carrera: 'Medicina Humana', estado: 'Activo', createdAt: daysAgo(0, 2) },
  { codigo: '#EA-2024-042', nombre: 'Ricardo Casas', email: 'ricardo.c@elite.edu', salon: 'Aula 105 - A', carrera: 'Ingeniería de Sistemas', estado: 'Activo', createdAt: daysAgo(0, 5) },
  { codigo: '#EA-2024-115', nombre: 'Lucía Paredes', email: 'lucia.p@elite.edu', salon: 'Aula 202 - C', carrera: 'Arquitectura', estado: 'Pendiente', createdAt: daysAgo(1, 1) },
  { codigo: '#EA-2024-089', nombre: 'Samuel Valdivia', email: 'samuel.v@elite.edu', salon: 'Aula 402 - B', carrera: 'Derecho', estado: 'Activo', createdAt: daysAgo(1, 3) },
  { codigo: '#EA-2024-032', nombre: 'Camila Gutiérrez', email: 'camila.g@elite.edu', salon: 'Aula 301 - A', carrera: 'Psicología', estado: 'Activo', createdAt: daysAgo(2, 0) },
];

const DOCENTES = [
  { codigo: '#DOC-2025-001', nombre: 'Ana Rojas', email: 'ana.rojas@elite.edu', especialidad: 'Matemáticas', cursos: ['Álgebra', 'Trigonometría'], estado: 'Activo', createdAt: daysAgo(0, 8) },
  { codigo: '#DOC-2025-002', nombre: 'Carlos López', email: 'carlos.lopez@elite.edu', especialidad: 'Física', cursos: ['Física General', 'Física Avanzada'], estado: 'Activo', createdAt: daysAgo(1, 6) },
  { codigo: '#DOC-2025-003', nombre: 'María García', email: 'maria.garcia@elite.edu', especialidad: 'Lenguaje', cursos: ['Lenguaje I', 'Literatura'], estado: 'Activo', createdAt: daysAgo(3, 0) },
  { codigo: '#DOC-2025-004', nombre: 'José Martínez', email: 'jose.martinez@elite.edu', especialidad: 'Historia', cursos: ['Historia Universal', 'Historia del Perú'], estado: 'Pendiente', createdAt: daysAgo(5, 4) },
  { codigo: '#DOC-2025-005', nombre: 'Rosa Huamán', email: 'rosa.h@elite.edu', especialidad: 'Biología', cursos: ['Biología General', 'Anatomía'], estado: 'Activo', createdAt: daysAgo(8, 2) },
];

const MATERIALES = [
  { nombre: 'Guía de Álgebra Avanzada.pdf', curso: 'Álgebra', tipo: 'PDF', tamano: '2.4 MB', icono: 'picture_as_pdf', colorClase: 'bg-error-container text-on-error-container', fecha: '2025-06-15', createdAt: daysAgo(0, 3) },
  { nombre: 'Separata de Trigonometría.docx', curso: 'Trigonometría', tipo: 'DOCX', tamano: '1.8 MB', icono: 'description', colorClase: 'bg-primary-container/10 text-primary', fecha: '2025-06-14', createdAt: daysAgo(1, 2) },
  { nombre: 'Diapositivas de Química Orgánica.pptx', curso: 'Química', tipo: 'PPTX', tamano: '5.2 MB', icono: 'present_to_all', colorClase: 'bg-tertiary-container/20 text-tertiary', fecha: '2025-06-13', createdAt: daysAgo(2, 5) },
  { nombre: 'Compendio de Biología.zip', curso: 'Biología', tipo: 'ZIP', tamano: '12.0 MB', icono: 'folder_zip', colorClase: 'bg-secondary-container text-secondary', fecha: '2025-06-12', createdAt: daysAgo(3, 1) },
  { nombre: 'Clase grabada: Cinemática.mp4', curso: 'Física', tipo: 'MP4', tamano: '45.3 MB', icono: 'movie', colorClase: 'bg-on-tertiary-fixed-variant/10 text-tertiary-fixed-dim', fecha: '2025-06-11', createdAt: daysAgo(4, 3) },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function toFirestoreValue(value) {
  if (typeof value === 'string') return { stringValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return { integerValue: value };
  return { nullValue: null };
}

function buildFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

async function patchDoc(collection, docId, data, idToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ fields: buildFields(data) }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`Firestore error [${collection}/${docId}]: ${json.error.message}`);
}

async function deleteDoc(collection, docId, idToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${docId}?key=${API_KEY}`;
  await fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${idToken}` } });
}

async function listDocIds(collection, idToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}?key=${API_KEY}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
  const json = await res.json();
  if (!json.documents) return [];
  return json.documents.map(d => d.name.split('/').pop());
}

function slugId(nombre) {
  return nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 40);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔥 Seeding Firestore collections...\n');

  const idToken = await signIn('admin@arguedas.edu.pe', 'admin123');
  console.log('✅ Autenticado como admin\n');

  // Estudiantes — limpiar anteriores y registrar (5 elements)
  console.log('📚 Estudiantes (limpiando duplicados...):');
  const existingEstIds = await listDocIds('estudiantes', idToken);
  for (const id of existingEstIds) await deleteDoc('estudiantes', id, idToken);
  console.log(`  🗑️  ${existingEstIds.length} estudiantes eliminados`);

  for (const est of ESTUDIANTES) {
    const docId = est.codigo.replace('#', '');
    process.stdout.write(`  ⏳ ${est.nombre}...`);
    try {
      await patchDoc('estudiantes', docId, est, idToken);
      console.log(' ✅');
    } catch (e) {
      console.log(` ❌ ${e.message}`);
    }
  }

  // Docentes — limpiar anteriores y registrar (5 elements)
  console.log('\n👨‍🏫 Docentes (limpiando duplicados...):');
  const existingDocIds = await listDocIds('docentes', idToken);
  for (const id of existingDocIds) await deleteDoc('docentes', id, idToken);
  console.log(`  🗑️  ${existingDocIds.length} docentes eliminados`);

  for (const doc of DOCENTES) {
    const docId = doc.codigo.replace('#', '');
    process.stdout.write(`  ⏳ ${doc.nombre}...`);
    try {
      await patchDoc('docentes', docId, doc, idToken);
      console.log(' ✅');
    } catch (e) {
      console.log(` ❌ ${e.message}`);
    }
  }

  // Materiales — borrar existentes y re-crear con ID slug (5 elements)
  console.log('\n📁 Materiales (limpiando duplicados...):');
  const existingMatIds = await listDocIds('materiales', idToken);
  for (const id of existingMatIds) await deleteDoc('materiales', id, idToken);
  console.log(`  🗑️  ${existingMatIds.length} docs anteriores eliminados`);

  for (const mat of MATERIALES) {
    const docId = slugId(mat.nombre);
    process.stdout.write(`  ⏳ ${mat.nombre}...`);
    try {
      await patchDoc('materiales', docId, mat, idToken);
      console.log(' ✅');
    } catch (e) {
      console.log(` ❌ ${e.message}`);
    }
  }

  console.log('\n✅ Seed completo.');
  console.log(`   📊 ${ESTUDIANTES.length} estudiantes | ${DOCENTES.length} docentes | ${MATERIALES.length} materiales`);
}

main().catch(console.error);
