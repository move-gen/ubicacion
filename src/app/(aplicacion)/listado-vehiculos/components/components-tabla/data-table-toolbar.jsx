"use client";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { estados } from "./estados";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";


export function DataTableToolbar({ table }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between space-y-2 lg:space-y-0 lg:space-x-2 w-full">
      <div className="flex flex-1 flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 w-full lg:w-auto">
        <Input
          placeholder="Filtrar por matrícula..."
          value={table.getColumn("matricula")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("matricula")?.setFilterValue(event.target.value)
          }
          className="h-8 w-full md:w-[150px] lg:w-[250px]"
        />
        {table.getColumn("estado") && (
          <DataTableFacetedFilter
            column={table.getColumn("estado")}
            title="Estados"
            options={estados}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-1 lg:px-2"
          >
            Resetear
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
