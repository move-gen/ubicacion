import "server-only";

// Utilizado en vehiculos y en la api para comprobar la fecha
export const obtenerFechaITV = (fechaString) => {
  if (!fechaString) return null; // Verifica si el string está vacío

  // Detecta el separador utilizado: '/' o '-'
  const separadores = ["/", "-"];
  let separador = null;

  for (const sep of separadores) {
    if (fechaString.includes(sep)) {
      separador = sep;
      break;
    }
  }

  if (!separador) {
    console.warn("Formato de fecha no reconocido:", fechaString);
    return null;
  }

  const [dia, mes, anyo] = fechaString.split(separador);

  // Verifica que día, mes y año existan
  if (!dia || !mes || !anyo) {
    console.warn("Fecha incompleta:", fechaString);
    return null;
  }

  // Padear día y mes si tienen un solo dígito
  const day = dia.padStart(2, "0");
  const month = mes.padStart(2, "0");

  let year;
  if (anyo.length === 2) {
    // Asume que el año de 2 dígitos pertenece al siglo 2000
    year = `20${anyo}`;
  } else if (anyo.length === 4) {
    year = anyo;
  } else {
    console.warn("Formato de año no reconocido:", anyo);
    return null;
  }

  // Crea y retorna el objeto Date
  const fecha = new Date(`${year}-${month}-${day}`);

  // Verifica si la fecha es válida
  if (isNaN(fecha.getTime())) {
    console.warn("Fecha inválida:", fechaString);
    return null;
  }

  return fecha;
};

export const comprobarSeguroITV = (fechaITV, seguro) => {
  const now = new Date();
  // Inicializamos el objeto que indicará los resultados
  const resultado = {
    fechaITVValida: true,
    seguroValido: true,
    todoValido: true, // Indicará si ambas condiciones son válidas
  };

  // Verificamos la fecha del ITV
  if (fechaITV < now) {
    resultado.fechaITVValida = false; // Si la fecha del ITV es menor que la fecha actual, falla
    resultado.todoValido = false; // Ya que al menos una validación falla
  }
  // Verificamos el seguro
  if (seguro === "NO MOVER" || !seguro) {
    resultado.seguroValido = false; // Si el seguro no es "NO MOVER", falla
    resultado.todoValido = false; // Ya que al menos una validación falla
  }

  // Devolvemos el objeto con los resultados
  return resultado;
};
