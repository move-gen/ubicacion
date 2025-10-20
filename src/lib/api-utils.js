// src/lib/api-utils.js

// Constantes para integración A3
export const A3_TIMEOUT = 25000; // 25 segundos
export const A3_MAX_RETRIES = 3;
export const A3_RETRY_DELAY = 2000; // 2 segundos entre reintentos

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
      // Backoff delay entre reintentos
      await new Promise(resolve => setTimeout(resolve, A3_RETRY_DELAY));
    }
  }
}
