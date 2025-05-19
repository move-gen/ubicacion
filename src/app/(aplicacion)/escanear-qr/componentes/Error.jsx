import { Button } from "@/components/ui/button";
import ErrorEscaneo from "./ErrorLottie";

export default function Error({ errores, onContinue }) {
  // ✅ Comprobamos si hay un error específico con el código "ITV_SEGURO_NO_VALIDO"
  const tieneErrorITV = errores.includes("ITV_SEGURO_NO_VALIDO");

  // ✅ Función para mostrar la lista de errores
  const mostrarMensajeError = () => {
    if (Array.isArray(errores)) {
      return (
        <ul className="list-disc list-inside text-left text-red-800">
          {errores.map(
            (error, index) =>
              error !== "ITV_SEGURO_NO_VALIDO" && ( // Excluir el código del mensaje
                <li key={index}>{error}</li>
              )
          )}
        </ul>
      );
    }

    return "Ha ocurrido un error desconocido. Actualice la página para continuar.";
  };

  return (
    <div className="flex flex-col items-center justify-center my-2 border bg-secondary text-primary rounded-md p-4 w-full md:w-3/4 lg:w-1/2 mx-auto">
      <h2 className="text-3xl py-1 font-medium tracking-tight text-center text-red-700 sm:text-4xl">
        ¡Ha ocurrido un error!
      </h2>
      {/* ✅ Mostrar mensaje de error */}
      <div className="text-black text-center mt-5">{mostrarMensajeError()}</div>
      {/* ✅ Animación de error */}
      <ErrorEscaneo />
      {/* ✅ Mostrar el botón "Continuar" si hay un error de ITV */}
      {tieneErrorITV && (
        <div className="flex flex-col items-center justify-center mt-4 p-4 bg-red-100 border border-red-300 rounded-md shadow-md">
          <p className="text-sm text-red-800 font-medium text-center mb-2">
            Puede continuar ubicando el vehículo en su ubicación actual, pero no
            debe moverlo a otro lugar
            <br />
          </p>
          <Button
            onClick={onContinue}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring focus:ring-red-300"
          >
            Continuar sin mover el vehículo
          </Button>
        </div>
      )}
    </div>
  );
}
