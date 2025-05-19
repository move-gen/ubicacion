import FormularioQR from "./componentes/FormularioQR";

export const metadata = {
  title: "Generador de pegatinas QR",
  description: "Generador de pegatinas QR",
};
export default function GenerarQR() {
  return (
    <div className="py-10 sm:py-10 items-center justify-center">
      <div className="mx-auto max-w-7xl w-full">
        <div className="mx-auto max-w-4xl sm:text-center w-full">
          <h2 className="text-3xl font-medium tracking-tight text-center text-colorPrincipal">
            GENERADOR DE PEGATINAS QR
          </h2>
          <p className="mt-6 text-lg text-center leading-8 text-gray-600 font-light">
            En este apartado se generará el QR para colocarlo en el vehículo.
            Una vez generado pulse en imprimir.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-4xl w-full bg-white rounded-3xl ring-1 shadow-lg ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-7xl">
          <FormularioQR />
        </div>
      </div>
    </div>
  );
}
