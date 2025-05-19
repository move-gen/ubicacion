// not-found.jsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Página no encontrada</h1>
      <p className="mb-4">Lo sentimos, la página que buscas no existe.</p>
      <Link href="/" className="text-colorPrincipal hover:underline">
        Volver al inicio
      </Link>
    </div>
  );
}
