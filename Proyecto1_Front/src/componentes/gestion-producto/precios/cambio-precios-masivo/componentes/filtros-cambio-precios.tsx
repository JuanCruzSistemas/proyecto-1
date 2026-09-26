import { Check, Eraser, Package, Save, Search } from "lucide-react";
import { useState } from "react";
import Select from "react-select";
import { CardHeader, CardTitle } from "../../../../ui/Card";
import { Button } from "../../../../ui/Button";
import PorcentajeInput from "../../../../herramientas/formateo-de-campos/porcentaje-input-simple";

type Props = {
  valoresFiltros: any;
  setValoresFiltros: any;
  marcas: any[];
  lineas: any[];
  productosLength: number;
  onBuscar: () => void;
  onAplicarCambios?: (valor: number, tipoActualizacion: "PORCENTAJE" | "MONTO") => void;
  onGuardarCambios?: () => void;
  onLimpiarFiltros: () => void;
};

const selectStyles = {
  control: (base: any) => ({ ...base, color: "black" }),
  singleValue: (base: any) => ({ ...base, color: "black" }),
  option: (base: any, { isSelected, isFocused }: any) => ({
    ...base,
    color: isSelected ? "white" : "black",
    backgroundColor: isSelected ? "#3b82f6" : isFocused ? "#93c5fd" : "white",
  }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};

export default function FiltrosCambioPrecios({
  valoresFiltros,
  setValoresFiltros,
  marcas,
  lineas,
  productosLength,
  onBuscar,
  onAplicarCambios,
  onGuardarCambios,
  onLimpiarFiltros,
}: Props) {
  const [valor, setValor] = useState(0);
  const [tipoActualizacion, setTipoActualizacion] = useState<"PORCENTAJE" | "MONTO">("PORCENTAJE");

  return (
    <CardHeader className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex w-full flex-col flex-wrap gap-4 md:flex-row">
        <CardTitle className="flex items-center space-x-2">
          <Package className="consultar-icon" />
          <span>Productos</span>
        </CardTitle>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <Select
              value={(marcas ?? []).find((option) => option.id === valoresFiltros.marcaId) ?? null}
              options={marcas ?? []}
              getOptionLabel={(option) => option.denominacion}
              getOptionValue={(option) => String(option.id)}
              onChange={(option) => setValoresFiltros({ ...valoresFiltros, marcaId: option?.id })}
              placeholder="Seleccione una marca"
              aria-label="Marca"
              noOptionsMessage={() => "Sin resultados"}
              isClearable
              className="min-w-56 text-black"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
          </div>

          <div>
            <Select
              value={(lineas ?? []).find((option) => option.id === valoresFiltros.lineaId) ?? null}
              options={lineas ?? []}
              getOptionLabel={(option) => option.denominacion}
              getOptionValue={(option) => String(option.id)}
              onChange={(option) => setValoresFiltros({ ...valoresFiltros, lineaId: option?.id })}
              placeholder="Seleccione una línea"
              aria-label="Línea"
              noOptionsMessage={() => "Sin resultados"}
              isClearable
              className="min-w-56 text-black"
              menuPortalTarget={document.body}
              styles={selectStyles}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Button variant="outline" onClick={onBuscar} title="Buscar productos">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={onLimpiarFiltros} title="Limpiar filtros">
            <Eraser className="h-4 w-4" />
          </Button>

          {onAplicarCambios && (
            <>
              <select
                value={tipoActualizacion}
                onChange={(event) => setTipoActualizacion(event.target.value as "PORCENTAJE" | "MONTO")}
                className="h-10 rounded-md border border-gray-300 bg-white px-2 text-black"
                disabled={productosLength === 0}
                aria-label="Tipo de actualización"
              >
                <option value="PORCENTAJE">Nuevo margen</option>
                <option value="MONTO">Monto fijo</option>
              </select>
              <PorcentajeInput
                name="valorCambio"
                value={valor}
                label={tipoActualizacion === "PORCENTAJE" ? "Margen" : "Monto"}
                suffix={tipoActualizacion === "PORCENTAJE" ? " %" : " $"}
                onChange={setValor}
                disabled={productosLength === 0}
                allowNegative={tipoActualizacion === "MONTO"}
              />
              <Button
                variant="outline"
                onClick={() => onAplicarCambios(valor, tipoActualizacion)}
                title="Aplicar cambios"
                disabled={productosLength === 0}
              >
                <Check className="h-4 w-4" />
              </Button>
            </>
          )}

          {onGuardarCambios && (
            <Button variant="outline" onClick={onGuardarCambios} title="Guardar cambios" disabled={productosLength === 0}>
              <Save className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
}