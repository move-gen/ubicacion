// src/lib/api-utils.js

export async function fetchWithTimeout(url, options, timeout = 55000) { // Aumentado a 55 segundos
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
    // Lanzar el error para que pueda ser capturado por la función que llama
    throw new Error(
      error.name === "AbortError" ? "Request timed out" : error.message
    );
  }
}

export async function retry(fn, retries = 2, functionName = 'anonymous function') {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      // Usar el nombre de la función en el log si se proporciona
      console.warn(`[${functionName}] Reintento ${attempt} fallido: ${error.message}`);
      if (attempt >= retries) {
        // Lanzar el error para que pueda ser capturado por la función que llama
        throw error;
      }
    }
  }
}
