import { NextResponse } from 'next/server';
import { getA3QueueStatus, retryFailedA3Jobs, processA3Queue } from '@/lib/a3-queue';

export async function GET() {
  const queue = await getA3QueueStatus();
  return NextResponse.json(queue);
}

export async function POST() {
  await retryFailedA3Jobs();
  await processA3Queue();
  return NextResponse.json({ message: 'Reintentos lanzados y worker ejecutado.' });
} 