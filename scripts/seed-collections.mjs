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
  { codigo: '#EA-2024-078', nombre: 'Diego Torres', email: 'diego.t@elite.edu', salon: 'Aula 201 - B', carrera: 'Ingeniería Civil', estado: 'Activo', createdAt: daysAgo(2, 4) },
  { codigo: '#EA-2024-156', nombre: 'Fernanda Vargas', email: 'fernanda.v@elite.edu', salon: 'Aula 305 - C', carrera: 'Administración', estado: 'Activo', createdAt: daysAgo(3, 2) },
  { codigo: '#EA-2024-201', nombre: 'Gabriela Huamán', email: 'gabriela.h@elite.edu', salon: 'Aula 101 - A', carrera: 'Medicina Humana', estado: 'Pendiente', createdAt: daysAgo(3, 6) },
  { codigo: '#EA-2024-067', nombre: 'Javier Mendoza', email: 'javier.m@elite.edu', salon: 'Aula 402 - A', carrera: 'Derecho', estado: 'Activo', createdAt: daysAgo(4, 1) },
  { codigo: '#EA-2024-188', nombre: 'Karina León', email: 'karina.l@elite.edu', salon: 'Aula 203 - C', carrera: 'Arquitectura', estado: 'Activo', createdAt: daysAgo(4, 5) },
  { codigo: '#EA-2024-223', nombre: 'Miguel Ríos', email: 'miguel.r@elite.edu', salon: 'Aula 106 - B', carrera: 'Ingeniería de Sistemas', estado: 'Activo', createdAt: daysAgo(5, 0) },
  { codigo: '#EA-2024-145', nombre: 'Nicole Pizarro', email: 'nicole.p@elite.edu', salon: 'Aula 304 - A', carrera: 'Psicología', estado: 'Pendiente', createdAt: daysAgo(5, 3) },
  { codigo: '#EA-2024-091', nombre: 'Óscar Sánchez', email: 'oscar.s@elite.edu', salon: 'Aula 401 - A', carrera: 'Administración', estado: 'Activo', createdAt: daysAgo(6, 2) },
  { codigo: '#EA-2024-177', nombre: 'Paola Tapia', email: 'paola.t@elite.edu', salon: 'Aula 202 - B', carrera: 'Medicina Humana', estado: 'Activo', createdAt: daysAgo(6, 7) },
  { codigo: '#EA-2024-210', nombre: 'Raúl Morales', email: 'raul.m@elite.edu', salon: 'Aula 103 - C', carrera: 'Ingeniería Civil', estado: 'Pendiente', createdAt: daysAgo(7, 1) },
  { codigo: '#EA-2024-054', nombre: 'Sofía Castro', email: 'sofia.c@elite.edu', salon: 'Aula 302 - A', carrera: 'Arquitectura', estado: 'Activo', createdAt: daysAgo(8, 0) },
  { codigo: '#EA-2024-239', nombre: 'Thiago Rodríguez', email: 'thiago.r@elite.edu', salon: 'Aula 405 - B', carrera: 'Derecho', estado: 'Activo', createdAt: daysAgo(9, 3) },
  { codigo: '#EA-2024-133', nombre: 'Valeria Ávila', email: 'valeria.a@elite.edu', salon: 'Aula 204 - A', carrera: 'Psicología', estado: 'Activo', createdAt: daysAgo(10, 0) },
  { codigo: '#EA-2024-198', nombre: 'Bruno Campos', email: 'bruno.c@elite.edu', salon: 'Aula 306 - B', carrera: 'Ingeniería de Sistemas', estado: 'Pendiente', createdAt: daysAgo(11, 2) },
  { codigo: '#EA-2024-248', nombre: 'Daniela Mendoza', email: 'daniela.m@elite.edu', salon: 'Aula 303 - A', carrera: 'Medicina Humana', estado: 'Activo', createdAt: daysAgo(12, 1) },
];

const DOCENTES = [
  { codigo: '#DOC-2025-001', nombre: 'Ana Rojas', email: 'ana.rojas@elite.edu', especialidad: 'Matemáticas', cursos: ['Álgebra', 'Trigonometría'], estado: 'Activo', createdAt: daysAgo(0, 8) },
  { codigo: '#DOC-2025-002', nombre: 'Carlos López', email: 'carlos.lopez@elite.edu', especialidad: 'Física', cursos: ['Física General', 'Física Avanzada'], estado: 'Activo', createdAt: daysAgo(1, 6) },
  { codigo: '#DOC-2025-003', nombre: 'María García', email: 'maria.garcia@elite.edu', especialidad: 'Lenguaje', cursos: ['Lenguaje I', 'Literatura'], estado: 'Activo', createdAt: daysAgo(3, 0) },
  { codigo: '#DOC-2025-004', nombre: 'José Martínez', email: 'jose.martinez@elite.edu', especialidad: 'Historia', cursos: ['Historia Universal', 'Historia del Perú'], estado: 'Pendiente', createdAt: daysAgo(5, 4) },
  { codigo: '#DOC-2025-005', nombre: 'Rosa Huamán', email: 'rosa.h@elite.edu', especialidad: 'Biología', cursos: ['Biología General', 'Anatomía'], estado: 'Activo', createdAt: daysAgo(8, 2) },
  { codigo: '#DOC-2025-006', nombre: 'Pedro Sánchez', email: 'pedro.sanchez@elite.edu', especialidad: 'Química', cursos: ['Química General', 'Química Orgánica'], estado: 'Activo', createdAt: daysAgo(10, 5) },
];

const MATERIALES = [
  { nombre: 'Guía de Álgebra Avanzada.pdf', curso: 'Álgebra', tipo: 'PDF', tamano: '2.4 MB', icono: 'picture_as_pdf', colorClase: 'bg-error-container text-on-error-container', fecha: '2025-06-15', createdAt: daysAgo(0, 3) },
  { nombre: 'Separata de Trigonometría.docx', curso: 'Trigonometría', tipo: 'DOCX', tamano: '1.8 MB', icono: 'description', colorClase: 'bg-primary-container/10 text-primary', fecha: '2025-06-14', createdAt: daysAgo(1, 2) },
  { nombre: 'Diapositivas de Química Orgánica.pptx', curso: 'Química', tipo: 'PPTX', tamano: '5.2 MB', icono: 'present_to_all', colorClase: 'bg-tertiary-container/20 text-tertiary', fecha: '2025-06-13', createdAt: daysAgo(2, 5) },
  { nombre: 'Compendio de Biología.zip', curso: 'Biología', tipo: 'ZIP', tamano: '12.0 MB', icono: 'folder_zip', colorClase: 'bg-secondary-container text-secondary', fecha: '2025-06-12', createdAt: daysAgo(3, 1) },
  { nombre: 'Clase grabada: Cinemática.mp4', curso: 'Física', tipo: 'MP4', tamano: '45.3 MB', icono: 'movie', colorClase: 'bg-on-tertiary-fixed-variant/10 text-tertiary-fixed-dim', fecha: '2025-06-11', createdAt: daysAgo(4, 3) },
  { nombre: 'Ejercicios de Razonamiento.pdf', curso: 'Razonamiento Matemático', tipo: 'PDF', tamano: '1.2 MB', icono: 'picture_as_pdf', colorClase: 'bg-error-container text-on-error-container', fecha: '2025-06-10', createdAt: daysAgo(5, 2) },
  { nombre: 'Resumen de Literatura.docx', curso: 'Literatura', tipo: 'DOCX', tamano: '0.8 MB', icono: 'description', colorClase: 'bg-primary-container/10 text-primary', fecha: '2025-06-09', createdAt: daysAgo(6, 4) },
  { nombre: 'Práctica de Geometría.pdf', curso: 'Geometría', tipo: 'PDF', tamano: '3.1 MB', icono: 'picture_as_pdf', colorClase: 'bg-error-container text-on-error-container', fecha: '2025-06-08', createdAt: daysAgo(7, 0) },
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

  // Estudiantes — doc ID = codigo sin '#'
  console.log('📚 Estudiantes:');
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

  // Docentes — doc ID = codigo sin '#'
  console.log('\n👨‍🏫 Docentes:');
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

  // Materiales — borrar existentes y re-crear con ID slug (idempotente)
  console.log('\n📁 Materiales (limpiando duplicados...):');
  const existingIds = await listDocIds('materiales', idToken);
  for (const id of existingIds) await deleteDoc('materiales', id, idToken);
  console.log(`  🗑️  ${existingIds.length} docs anteriores eliminados`);

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
