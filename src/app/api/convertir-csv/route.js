import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("csvFile");

    if (!file) {
      return NextResponse.json(
        { error: "No se encontró ningún archivo CSV." },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer).toString("utf8");

    // Procesar línea por línea
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    const csvOutput = ['matricula,ubicacion']; // Encabezado
    let procesados = 0;
    let errores = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Detectar patrones comunes
      // Patrón 1: "MATRICULA,Ubicacion,Almacen Nave X"
      // Patrón 2: "MATRICULA\tUbicacion\tAlmacen Nave X"
      // Patrón 3: "MATRICULA Ubicacion Almacen Nave X"
      
      let matricula = null;
      let ubicacion = null;

      // Intentar con coma
      if (trimmedLine.includes(',')) {
        const parts = trimmedLine.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          matricula = parts[0];
          // Unir todas las partes restantes como ubicación
          ubicacion = parts.slice(1).join(' ').trim();
        }
      }
      // Intentar con tabulación
      else if (trimmedLine.includes('\t')) {
        const parts = trimmedLine.split('\t').map(p => p.trim());
        if (parts.length >= 2) {
          matricula = parts[0];
          ubicacion = parts.slice(1).join(' ').trim();
        }
      }
      // Intentar con espacios (formato: MATRICULA RestoDeLaLinea)
      else {
        const spaceMatch = trimmedLine.match(/^([A-Z0-9]+)\s+(.+)$/i);
        if (spaceMatch) {
          matricula = spaceMatch[1];
          ubicacion = spaceMatch[2].trim();
        }
      }

      if (matricula && ubicacion) {
        // Limpiar la ubicación (remover "Almacen Nave X" si existe al final)
        const ubicacionLimpia = ubicacion
          .replace(/\s*,\s*Almacen\s+Nave\s+\d+\s*$/i, '')
          .replace(/\s*Almacen\s+Nave\s+\d+\s*$/i, '')
          .trim();

        csvOutput.push(`${matricula},${ubicacionLimpia}`);
        procesados++;
      } else {
        errores++;
      }
    }

    const csvContent = csvOutput.join('\n');

    return NextResponse.json({
      success: true,
      procesados,
      errores,
      csvContent,
      totalLineas: lines.length,
    });
  } catch (error) {
    console.error("Error al convertir CSV:", error);
    return NextResponse.json(
      { error: "Error al convertir el archivo CSV.", details: error.message },
      { status: 500 }
    );
  }
}

