import fs from 'fs/promises';
const QUEUE_PATH = './a3-queue.json';

export async function addToA3Queue(job) {
  let queue = [];
  try {
    const data = await fs.readFile(QUEUE_PATH, 'utf8');
    queue = JSON.parse(data);
  } catch (e) { /* archivo no existe, cola vacía */ }
  // Evitar duplicados por matrícula
  queue = queue.filter(j => j.matricula !== job.matricula);
  queue.push({ ...job, estado: 'pendiente', intentos: 0, error: null });
  await fs.writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2));
}

// --- Worker para procesar la cola ---
const MAX_INTENTOS = 6;
const BATCH_SIZE = 5;
const TIMEOUT_MS = 20000; // 20 segundos

async function fetchWithTimeout(url, options = {}, timeout = TIMEOUT_MS) {
  return await Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout)),
  ]);
}

export async function processA3Queue() {
  let queue = [];
  try {
    const data = await fs.readFile(QUEUE_PATH, 'utf8');
    queue = JSON.parse(data);
  } catch (e) { return; }

  let updated = false;
  for (const job of queue.filter(j => j.estado === 'pendiente' && j.intentos < MAX_INTENTOS).slice(0, BATCH_SIZE)) {
    try {
      job.estado = 'procesando';
      await fs.writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2));
      // Llama a la API de A3
      const url = `http://212.64.162.34:8080/api/articulo/${job.matricula}`;
      const body = { Caracteristica1: job.ubicacionA3 };
      let response = await fetchWithTimeout(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', APIKEY: process.env.API_KEY },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`A3 error: ${response.status}`);
      job.estado = 'completado';
      job.error = null;
      updated = true;
      // Aquí podrías actualizar el coche en la BD si tienes acceso
    } catch (e) {
      job.intentos++;
      job.estado = 'error';
      job.error = e.message;
      updated = true;
    }
  }
  if (updated) await fs.writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2));
}

// --- Endpoint helpers ---
export async function getA3QueueStatus() {
  try {
    const data = await fs.readFile(QUEUE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) { return []; }
}

export async function retryFailedA3Jobs() {
  let queue = [];
  try {
    const data = await fs.readFile(QUEUE_PATH, 'utf8');
    queue = JSON.parse(data);
  } catch (e) { return; }
  let updated = false;
  for (const job of queue.filter(j => j.estado === 'error' && j.intentos < MAX_INTENTOS)) {
    job.estado = 'pendiente';
    updated = true;
  }
  if (updated) await fs.writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2));
} 