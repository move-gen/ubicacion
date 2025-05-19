import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const Geolocalizacion = ({ setUbicacionInicialDelUsuario }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        setUbicacionInicialDelUsuario({
          longitud: position.coords.longitude,
          latitud: position.coords.latitude,
        });
        setError(null); // Limpiar cualquier error anterior
      },
      function (error) {
        if (error.code === error.PERMISSION_DENIED) {
          const errorMessage =
            "Permisos de ubicación denegados. Por favor, actívelos. Y recargue la página";
          toast.error(errorMessage);
          setError(errorMessage);
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          const errorMessage =
            "La ubicación no está disponible. Inténtelo de nuevo.";
          toast.error(errorMessage);
          setError(errorMessage);
        } else if (error.code === error.TIMEOUT) {
          const errorMessage =
            "La solicitud de ubicación ha caducado. Inténtelo de nuevo.";
          toast.error(errorMessage);
          setError(errorMessage);
        } else {
          const errorMessage =
            "Error al obtener ubicación. Por favor, verifique los permisos.";
          toast.error(errorMessage);
          setError(errorMessage);
        }
      },
      {
        enableHighAccuracy: true,
      }
    );
  }, [setUbicacionInicialDelUsuario]);

  return error ? (
    <div className="flex items-center text-red-500 mb-5">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 mr-2 mb-">
        <X className="text-white" />
      </div>
      {error}
    </div>
  ) : null;
};

export default Geolocalizacion;
