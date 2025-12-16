import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

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

    // Detectar el delimitador
    const firstLine = fileContent.split('\n')[0];
    let delimiter = ',';
    
    if (firstLine.includes('\t')) {
      delimiter = '\t';
    } else if (firstLine.includes(';')) {
      delimiter = ';';
    } else if (firstLine.includes('|')) {
      delimiter = '|';
    }

    // Obtener primeras líneas
    const lines = fileContent.split('\n').slice(0, 10);

    let records = [];
    let parseError = null;
    
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: delimiter,
        relax_column_count: true,
      });
    } catch (err) {
      parseError = err.message;
    }

    return NextResponse.json({
      fileName: file.name,
      fileSize: file.size,
      delimiter: delimiter === '\t' ? 'TAB' : delimiter,
      firstLines: lines,
      totalRecords: records.length,
      columns: records.length > 0 ? Object.keys(records[0]) : [],
      sampleRecords: records.slice(0, 5),
      parseError: parseError,
    });
  } catch (error) {
    console.error("Error al validar CSV:", error);
    return NextResponse.json(
      { error: "Error al validar el archivo CSV.", details: error.message },
      { status: 500 }
    );
  }
}

