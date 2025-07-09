import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(async function middleware(req) {}, {
  isReturnToCurrentPage: true,
  loginPage: "/login",
  isAuthorized: ({ token, req }) => {
    const url = req.nextUrl.pathname;

    if (
      url.startsWith("/dashboard") ||
      url.startsWith("/usuarios") ||
      url.startsWith("/ubicaciones") ||
      url.startsWith("/subir-csv")
    ) {
      return token.permissions.includes("crud:ubicacion_coches");
    } else if (
      url.startsWith("/generar-qr") ||
      url.startsWith("/listado-vehiculos")
    ) {
      return token.permissions.includes("generar:qr");
    }
    return true;
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ubicaciones",
    "/generar-qr",
    "/pdf/:path*",
    "/usuarios",
    "/subir-csv",
    "/api/imagen-coche",
    "/api/datosVehiculo",
    "/api/escanear-qr",
    "/escanear-qr",
    "/api/add-imagen",
    "/api/comprobarSeguroITV",
    "/pedir-vehiculo",
    "/listado-vehiculos",
    "/api/obtener-ubicaciones",
    "/api/comprobar-a3",
  ],
};
