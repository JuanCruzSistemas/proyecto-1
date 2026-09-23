import { useState, useEffect, useCallback } from "react";
// Ajusta estas rutas a donde tengas tu servicio e interfaz
import ProductoService, { HistorialPrecio } from "../services/producto-service";

export const useHistorialPrecio = (productoId: number) => {
  const [historial, setHistorial] = useState<HistorialPrecio[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cargarHistorial = useCallback(async () => {
    if (!productoId || productoId <= 0) return;

    setLoading(true);
    setError(null);

    try {
      const data = await ProductoService.obtenerHistorialPrecio(productoId);

      const dataOrdenada = Array.isArray(data)
        ? [...data].sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
          )
        : [];

      setHistorial(dataOrdenada);
    } catch (err: any) {
      console.error("Error al cargar historial de precios:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo cargar el historial de precios."
      );
    } finally {
      setLoading(false);
    }
  }, [productoId]);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  return { historial, loading, error, recargar: cargarHistorial };
};
