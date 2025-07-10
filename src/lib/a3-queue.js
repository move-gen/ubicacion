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