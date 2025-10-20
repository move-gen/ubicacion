// src/lib/a3-sync.js
// Módulo central para sincronización con A3

import { fetchWithTimeout, retry, A3_TIMEOUT } from '@/lib/api-utils';

const A3_API_URL = process.env.A3_API_URL || 'http://212.64.162.34:8080';

/**
 * Sincroniza un vehículo con A3
 * @param {string} matricula - Matrícula del vehículo
 * @param {string} ubicacionA3 - Ubicación a actualizar en A3 (nombreA3)
 * @param {string} logPrefix - Prefijo para los logs (ej: '[CRON_A3]')
 * @returns {Promise<{success: boolean, status?: number, responseBody?: string, error?: string}>}
 */
export async function syncVehicleToA3(matricula, ubicacionA3, logPrefix = '[A3_SYNC]') {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    const error = 'API_KEY de A3 no configurada';
    console.error(`${logPrefix} ${error}`);
    throw new Error(error);
  }

  if (!matricula) {
    const error = 'Matrícula no proporcionada';
    console.error(`${logPrefix} ${error}`);
    throw new Error(error);
  }

  if (!ubicacionA3) {
    const error = `Vehículo ${matricula}: ubicación sin nombreA3 configurado`;
    console.error(`${logPrefix} ${error}`);
    throw new Error(error);
  }

  const url = `${A3_API_URL}/api/articulo/${matricula}`;
  const body = { Caracteristica1: ubicacionA3 };

  console.log(`${logPrefix} Iniciando sincronización para ${matricula}: ubicación="${ubicacionA3}"`);
  console.log(`${logPrefix} URL: ${url}`);

  let responseStatus = 0;
  let responseBody = '';

  try {
    await retry(async () => {
      const response = await fetchWithTimeout(url, {
        method: 'PUT',
        headers: {
          'APIKEY': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }, A3_TIMEOUT);

      responseStatus = response.status;

      try {
        const clonedResponse = response.clone();
        responseBody = await clonedResponse.text();
        if (!responseBody) {
          responseBody = 'Respuesta de A3 vacía';
        }
      } catch (e) {
        responseBody = 'No se pudo leer respuesta de A3';
        console.warn(`${logPrefix} Advertencia: No se pudo leer el cuerpo de la respuesta de A3:`, e.message);
      }

      if (!response.ok) {
        throw new Error(`Error API A3. Status: ${responseStatus}. Respuesta: ${responseBody}`);
      }

      console.log(`${logPrefix} Sincronización exitosa para ${matricula} (Status ${responseStatus})`);
    }, undefined, `syncVehicleToA3_${matricula}`);

    return {
      success: true,
      status: responseStatus,
      responseBody
    };

  } catch (error) {
    console.error(`${logPrefix} Error sincronizando ${matricula}:`, error.message);
    return {
      success: false,
      status: responseStatus,
      responseBody,
      error: error.message
    };
  }
}

/**
 * Obtiene datos de un vehículo desde A3
 * @param {string} matricula - Matrícula del vehículo
 * @param {string} logPrefix - Prefijo para los logs
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function getVehicleFromA3(matricula, logPrefix = '[A3_SYNC]') {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    const error = 'API_KEY de A3 no configurada';
    console.error(`${logPrefix} ${error}`);
    throw new Error(error);
  }

  if (!matricula) {
    const error = 'Matrícula no proporcionada';
    console.error(`${logPrefix} ${error}`);
    throw new Error(error);
  }

  const url = `${A3_API_URL}/api/articulo/${matricula}`;
  console.log(`${logPrefix} Obteniendo datos de ${matricula} desde A3`);

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'APIKEY': apiKey,
        'Content-Type': 'application/json'
      }
    }, A3_TIMEOUT);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error API A3. Status: ${response.status}. Respuesta: ${errorText}`);
    }

    const data = await response.json();
    console.log(`${logPrefix} Datos obtenidos exitosamente para ${matricula}`);

    return {
      success: true,
      data
    };

  } catch (error) {
    console.error(`${logPrefix} Error obteniendo datos de ${matricula}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

