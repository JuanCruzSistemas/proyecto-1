import { Search, Package, Check, Save, Eraser } from "lucide-react";
import { useState } from "react";
import Select from "react-select";
import { CardHeader, CardTitle } from "../../../../ui/Card";
import { Input } from "../../../../ui/Input";
import { Button } from "../../../../ui/Button";
import PorcentajeInput from "../../../../herramientas/formateo-de-campos/porcentaje-input-simple";

type TipoActualizacion = "PORCENTAJE" | "MONTO";

const opcionesTipoActualizacion = [
  { value: "PORCENTAJE", label: "Porcentaje (%)" },
  { value: "MONTO", label: "Monto Fijo ($)" }
];

type Props = { 
    valoresFiltros: any; 
    setValoresFiltros: any; 
    marcas: any[]; 
    lineas: any[]; 
    sublineas: any[]; 
    productosLength: number; 
    onBuscar: () => void; 
    onAplicarCambios: (valor: number, tipo: TipoActualizacion) => void; 
    onGuardarCambios: () => void; 
    fetchMarcas: () => void;
    fetchLineas: () => void;
    onLimpiarFiltros: () => void;
};

export default function FiltrosCambioPrecios({
  valoresFiltros,
  setValoresFiltros,
  marcas,
  lineas,
  sublineas,
  productosLength,
  onBuscar,
  onAplicarCambios,
  onGuardarCambios,
  fetchMarcas,
  fetchLineas,
  onLimpiarFiltros
}: Props) {
  return (
    <CardHeader className="flex flex-col gap-4 p-4">
      <CardTitle className="flex items-center gap-2">
        <Package className="consultar-icon" />
        <span>Lista de precios</span>
      </CardTitle>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          type="text"
          placeholder="Buscar marca..."
          value={valoresFiltros.denominacionMarca ?? ""}
          onChange={(event) =>
            setValoresFiltros({ ...valoresFiltros, denominacionMarca: event.target.value })
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") fetchMarcas();
          }}
        />
        <Select
          value={(marcas ?? []).find((option) => option.id === valoresFiltros.marcaId) || null}
          options={marcas ?? []}
          getOptionLabel={(option) => option.denominacion}
          getOptionValue={(option) => String(option.id)}
          onChange={(option) => setValoresFiltros({ ...valoresFiltros, marcaId: option?.id })}
          placeholder="Marca"
          className="min-w-44 text-black"
        />
        <Input
          type="text"
          placeholder="Buscar línea..."
          value={valoresFiltros.denominacionLinea ?? ""}
          onChange={(event) =>
            setValoresFiltros({ ...valoresFiltros, denominacionLinea: event.target.value })
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") fetchLineas();
          }}
        />
        <Select
          value={(lineas ?? []).find((option) => option.id === valoresFiltros.lineaId) || null}
          options={lineas ?? []}
          getOptionLabel={(option) => option.denominacion}
          getOptionValue={(option) => String(option.id)}
          onChange={(option) => setValoresFiltros({ ...valoresFiltros, lineaId: option?.id })}
          placeholder="Línea"
          className="min-w-44 text-black"
        />
        <Select
          value={(sublineas ?? []).find((option) => option.id === valoresFiltros.sublineaId) || null}
          options={sublineas ?? []}
          getOptionLabel={(option) => option.denominacion}
          getOptionValue={(option) => String(option.id)}
          onChange={(option) => setValoresFiltros({ ...valoresFiltros, sublineaId: option?.id })}
          placeholder="Sublínea"
          className="min-w-44 text-black"
        />
        <Button onClick={onBuscar} title="Buscar productos">
          <Search className="h-4 w-4" />
        </Button>
        <Button onClick={onLimpiarFiltros} title="Limpiar filtros">
          <Eraser className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
}