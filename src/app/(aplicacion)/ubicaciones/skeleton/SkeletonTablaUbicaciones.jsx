const SkeletonUbicaciones = () => {
  return (
    <div className="w-full animate-pulse">
      {/* Header con título y botón */}
      <div className="flex items-center justify-between py-4">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>

      {/* Tabla con contenido de esqueleto */}
      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["", "Latitud", "Longitud", "Ubicación", "Nombre API", ""].map(
                (header, idx) => (
                  <th
                    key={idx}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div
                      className={`h-4 ${
                        header ? "bg-gray-300" : "bg-transparent"
                      } rounded`}
                    ></div>
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-4"></div>
                </td>
                {Array.from({ length: 4 }).map((_, cellIdx) => (
                  <td key={cellIdx} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con botones de navegación */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonUbicaciones;
