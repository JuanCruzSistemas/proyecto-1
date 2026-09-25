import { useState } from "react";
import CambioPreciosMasivoService from "../cambio-precios-masivo-service";
import { ConsultarProductosCambioPreciosMasivo } from "../../../../../interfaces/gestion-producto/producto/interfaces-producto";
import { ResponsePost } from "../../../../../interfaces/generales/interfaces-generales";

export function useCambioPrecios(usuarioId: number | null) {
  const [productos, setProductos] =
    useState<ConsultarProductosCambioPreciosMasivo[]>([]);
  const [loading, setLoading] = useState(false);

  const buscarProductos = async (filtros: any) => {
    setLoading(true);
    try {
      const productosFiltrados: ConsultarProductosCambioPreciosMasivo[] = [];
      const take = 500;
      let skip = 0;
      let total = Number.POSITIVE_INFINITY;

      while (skip < total) {
        const pagina = await CambioPreciosMasivoService.obtener({ ...filtros, skip, take });
        productosFiltrados.push(...pagina.data);
        total = pagina.total;
        if (pagina.data.length === 0) break;
        skip += pagina.data.length;
      }

      setProductos(productosFiltrados);
    } finally {
      setLoading(false);
    }
  };

  const aplicarCambios = async (
    valor: number,
    tipoActualizacion: "PORCENTAJE" | "MONTO",
  ) => {
    setLoading(true);
    try {
      const payload = {
        items: productos,
        valor,
        tipoActualizacion,
      };
      const productosActualizados =
        await CambioPreciosMasivoService.aplicarCambios(payload);
      setProductos(productosActualizados);
    } finally {
      setLoading(false);
    }
  };

  const guardarCambios = async (): Promise<ResponsePost> => {
    setLoading(true);
    try {
      const payload = {
        items: productos,
        usuarioCreatedId: usuarioId,
      };
      const response =
        await CambioPreciosMasivoService.guardarCambios(payload);
      setProductos((prev) => prev.map((p) => ({ ...p, dirty: false })));
      return response;
    } finally {
      setLoading(false);
    }
  };

  const actualizarProductoLocal = (
   productoActualizado: ConsultarProductosCambioPreciosMasivo
   ) => {
   setProductos((prevProductos) =>
      prevProductos.map((p) =>
         p.id === productoActualizado.id
         ? { ...productoActualizado, dirty: true }
         : p
      )
   );
   };

  return {
    productos,
    loading,
    setProductos,
    buscarProductos,
    aplicarCambios,
    guardarCambios,
    actualizarProductoLocal
  };
}