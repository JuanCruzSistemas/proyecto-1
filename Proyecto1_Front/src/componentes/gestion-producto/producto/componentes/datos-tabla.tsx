import { Column, TablaAGGrid } from "../../../herramientas/tablas/tabla-flexible-ag-grid";
import { ConsultarProducto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";
import { ProductoActions } from "./producto-action";

interface Props {
  productos: ConsultarProducto[];
  columns: Column<ConsultarProducto>[];
  puedeAccionar: boolean;
  onEditar: (id: number) => void;
  onInfo: (id: number) => void;
  onDelete: (id: number) => void;
  onCambioPrecios?: (id: number) => void;
  onHistorial?: (id: number) => void;
}

export function DatosTabla({
  productos,
  columns,
  puedeAccionar,
  onEditar,
  onInfo,
  onDelete,
  onCambioPrecios,
  onHistorial,
}: Props) {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <TablaAGGrid
        columns={columns}
        data={productos}
        actions={
          puedeAccionar
            ? (row) => (
                <ProductoActions
                  producto={row}
                  onEditar={onEditar}
                  onInfo={onInfo}
                  onDelete={onDelete}
                  onCambioPrecios={onCambioPrecios}
                  onHistorial={onHistorial}
                />
              )
            : undefined
        }
        actionsFlex={0.8}
        rowHeight={55}
      />
    </div>
  );
}
