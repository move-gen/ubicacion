import { NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function POST(request) {
  try {
    const { isAuthenticated } = getKindeServerSession();
    
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { matricula } = await request.json();
    
    if (!matricula) {
      return NextResponse.json({ error: 'Matrícula requerida' }, { status: 400 });
    }

    const apiKey = process.env.API_KEY;
    const A3_API_URL = process.env.A3_API_URL || 'http://212.64.162.34:8080';
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API_KEY no configurada' }, { status: 500 });
    }

    const url = `${A3_API_URL}/api/articulo/${matricula}`;
    const diagnostico = {
      matricula,
      url,
      timestamp: new Date().toISOString(),
      intentos: []
    };

    console.log(`[DIAGNÓSTICO] Iniciando diagnóstico para ${matricula}`);
    console.log(`[DIAGNÓSTICO] URL: ${url}`);

    // Hacer 3 intentos con timeouts incrementales para diagnóstico
    const timeouts = [5000, 10000, 20000]; // 5s, 10s, 20s

    for (let i = 0; i < timeouts.length; i++) {
      const timeout = timeouts[i];
      const intento = {
        numero: i + 1,
        timeout: timeout,
        inicio: new Date().toISOString()
      };

      console.log(`[DIAGNÓSTICO] Intento ${i + 1}/${timeouts.length} con timeout de ${timeout}ms`);

      const controller = new AbortController();
      let timeoutId;
      const startTime = Date.now();

      try {
        timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'APIKEY': apiKey,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        intento.fin = new Date().toISOString();
        intento.duracion = duration;
        intento.status = response.status;
        intento.statusText = response.statusText;

        console.log(`[DIAGNÓSTICO] Respuesta recibida en ${duration}ms - Status: ${response.status}`);

        if (response.ok) {
          try {
            const data = await response.json();
            intento.resultado = 'exitoso';
            intento.data = data;
            diagnostico.intentos.push(intento);
            
            console.log(`[DIAGNÓSTICO] Éxito en intento ${i + 1}`);
            console.log(`[DIAGNÓSTICO] Datos recibidos:`, JSON.stringify(data, null, 2));
            
            // Si fue exitoso, retornar inmediatamente
            return NextResponse.json({
              success: true,
              mensaje: `Diagnóstico exitoso en intento ${i + 1} (${duration}ms)`,
              diagnostico
            });
          } catch (parseError) {
            intento.resultado = 'error_parse';
            intento.error = parseError.message;
            diagnostico.intentos.push(intento);
            console.error(`[DIAGNÓSTICO] Error parseando JSON:`, parseError.message);
          }
        } else {
          intento.resultado = 'error_http';
          intento.error = `HTTP ${response.status}: ${response.statusText}`;
          
          try {
            const errorText = await response.text();
            intento.errorDetalle = errorText;
            console.error(`[DIAGNÓSTICO] Error HTTP: ${response.status} - ${errorText}`);
          } catch (e) {
            console.error(`[DIAGNÓSTICO] Error HTTP: ${response.status} (no se pudo leer el cuerpo)`);
          }
          
          diagnostico.intentos.push(intento);
        }

      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        intento.fin = new Date().toISOString();
        intento.duracion = duration;
        intento.resultado = 'error_timeout_o_red';
        intento.error = error.name === 'AbortError' 
          ? `Timeout después de ${timeout}ms` 
          : error.message;
        
        diagnostico.intentos.push(intento);
        console.error(`[DIAGNÓSTICO] Error en intento ${i + 1}:`, intento.error);
        
        // Si fue el último intento, continuar para retornar el diagnóstico completo
        if (i === timeouts.length - 1) {
          break;
        }
        
        // Esperar 2 segundos antes del siguiente intento
        console.log(`[DIAGNÓSTICO] Esperando 2 segundos antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    console.error(`[DIAGNÓSTICO] Todos los intentos fallaron para ${matricula}`);
    
    return NextResponse.json({
      success: false,
      mensaje: 'Todos los intentos fallaron',
      diagnostico,
      recomendaciones: [
        'A3 está extremadamente lento o no responde',
        'Verifica que A3 esté funcionando correctamente',
        'Considera aumentar el timeout en producción',
        'Verifica si hay problemas de red entre Vercel y A3',
        'Contacta al soporte de A3 para reportar problemas de rendimiento'
      ]
    });

  } catch (error) {
    console.error('[DIAGNÓSTICO] Error general:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', detalle: error.message },
      { status: 500 }
    );
  }
}

