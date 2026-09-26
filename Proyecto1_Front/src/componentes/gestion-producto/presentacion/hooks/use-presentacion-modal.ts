import { useState } from "react";
import { Presentacion } from "../../../../interfaces/gestion-producto/presentacion/interfaces-presentacion";

export type PresentacionModalTipo = "alta" | "edicion" | null;

export function usePresentacionModal() {
  const [tipo, setTipo] = useState<PresentacionModalTipo>(null);
  const [presentacion, setPresentacion] = useState<Presentacion | null>(null);

  const abrirAlta = () => {
    setPresentacion(null);
    setTipo("alta");
  };

  const abrirEdicion = (presentacion: Presentacion) => {
    setPresentacion(presentacion);
    setTipo("edicion");
  };

  const cerrar = () => {
    setTipo(null);
    setPresentacion(null);
  };

  return { tipo, presentacion, abrirAlta, abrirEdicion, cerrar };
}
