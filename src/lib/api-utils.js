// src/lib/api-utils.js

// Constantes para integración A3
export const A3_TIMEOUT = 12000; // 12 segundos (ajustado para Vercel)
export const A3_MAX_RETRIES = 1; // Solo 1 reintento
export const A3_RETRY_BASE_DELAY = 500; // 0.5 segundos base para backoff exponencial

export async function fetchWithTimeout(url, options, timeout = A3_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw new Error(
      error.name === "AbortError" ? "Request timed out" : error.message
    );
  }
}

export async function retry(fn, retries = A3_MAX_RETRIES, functionName = 'anonymous function') {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      console.warn(`[${functionName}] Reintento ${attempt}/${retries} fallido: ${error.message}`);
      if (attempt >= retries) {
        throw error;
      }
      // ✅ IMPROVED: Exponential backoff (2s, 4s, 8s...)
      const delay = A3_RETRY_BASE_DELAY * Math.pow(2, attempt - 1);
      console.log(`[${functionName}] Esperando ${delay}ms antes del siguiente reintento...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
