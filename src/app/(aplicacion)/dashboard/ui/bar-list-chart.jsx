"use client";
import { useState } from "react";
import { BarList } from "@tremor/react";
import { Button } from "@/components/ui/button";

export const BarListChart = ({ datosZona }) => {
  // Estado para la página actual y el número de elementos por página
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Número de elementos por página

  // Ordenar datosZona de mayor a menor basado en un valor específico
  const sortedData = datosZona.sort((a, b) => b.value - a.value);

  // Cálculo de los índices de los elementos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <>
      <BarList
        data={currentItems}
        className="mx-auto"
        sortOrder="none"
        showAnimation={true}
      />

      <div className="flex flex-col items-center justify-center md:flex-row md:items-center md:justify-between py-4 space-y-2 md:space-y-0 md:space-x-4">
        {/* Texto de la página actual, alineado a la izquierda en dispositivos de escritorio */}
        <div className="text-sm text-gray-600 md:order-1 md:text-left mt-3 text-center">
          Página {currentPage} de {totalPages}
        </div>

        {/* Botones de paginación, alineados a la derecha en dispositivos de escritorio */}
        <div className="flex space-x-2 md:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </>
  );
};
