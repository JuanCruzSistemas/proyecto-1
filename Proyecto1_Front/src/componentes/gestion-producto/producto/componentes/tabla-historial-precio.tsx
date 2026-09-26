import React, { useEffect, useState } from "react";
import ProductoService from "../services/producto-service";
import { Producto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";
import { Usuario } from "../../../../interfaces/gestion-usuario/interfaces-usuario";


export interface HistorialPrecioItem {
  id?: number;
  fechaCreacion?: string;
  fecha?: string;
  precioAnterior: number;
  precioNuevo: number;
  costoAnterior: number;
  costoNuevo: number;
  margenAnterior: number;
  margenNuevo: number;
  motivo: string;
  producto?: Producto;
  usuario?: Usuario;
}

interface Props {
  productoId: number;
}

export const TablaHistorialPrecio: React.FC<Props> = ({ productoId }) => {
  const [historial, setHistorial] = useState<HistorialPrecioItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productoId) {
      cargarHistorial();
    }
  }, [productoId]);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      setError(null);

      const res: any = await ProductoService.obtenerHistorialPrecio(productoId);
      const lista = Array.isArray(res) ? res : res?.data || [];
      setHistorial(lista);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo cargar el historial de precios."
      );
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500 text-sm">Cargando historial de precios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">
        {error}
      </div>
    );
  }

  if (historial.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No hay registros de cambios de precio para este producto.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse border border-gray-200">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-3 py-2 border">Fecha</th>
            <th className="px-3 py-2 border text-center">Costo (Ant. → Nuevo)</th>
            <th className="px-3 py-2 border text-center">Margen (Ant. → Nuevo)</th>
            <th className="px-3 py-2 border text-center">Precio Final (Ant. → Nuevo)</th>
            <th className="px-3 py-2 border">Usuario</th>
            <th className="px-3 py-2 border">Motivo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {historial.map((item, idx) => {
            const fechaVal = item.fechaCreacion || item.fecha;
            const fechaFormateada = fechaVal
              ? new Date(fechaVal).toLocaleDateString() +
                " " +
                new Date(fechaVal).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-";

            const nombreUsuario =
              item.usuario?.mail
                ? `${item.usuario.mail}`.trim()
                :item.usuario?.mail ||
                  "Sistema";

            return (
              <tr key={item.id ?? idx} className="hover:bg-gray-50">
                {/* Fecha */}
                <td className="px-3 py-2 border text-gray-600 whitespace-nowrap text-xs">
                  {fechaFormateada}
                </td>

                {/* Costo: Anterior -> Nuevo */}
                <td className="px-3 py-2 border text-center whitespace-nowrap">
                  <span className="text-gray-400 line-through mr-1">
                    ${Number(item.costoAnterior || 0).toFixed(2)}
                  </span>
                  <span className="font-semibold text-gray-800">
                    ${Number(item.costoNuevo || 0).toFixed(2)}
                  </span>
                </td>

                {/* Margen: Anterior -> Nuevo */}
                <td className="px-3 py-2 border text-center whitespace-nowrap">
                  <span className="text-gray-400 mr-1">
                    {item.margenAnterior != null ? `${item.margenAnterior}%` : "-"} →
                  </span>
                  <span className="font-semibold text-blue-700">
                    {item.margenNuevo != null ? `${item.margenNuevo}%` : "-"}
                  </span>
                </td>

                {/* Precio: Anterior -> Nuevo */}
                <td className="px-3 py-2 border text-center whitespace-nowrap">
                  <span className="text-gray-400 line-through mr-1">
                    ${Number(item.precioAnterior || 0).toFixed(2)}
                  </span>
                  <span className="font-bold text-green-700">
                    ${Number(item.precioNuevo || 0).toFixed(2)}
                  </span>
                </td>

                {/* Usuario */}
                <td className="px-3 py-2 border text-gray-700 whitespace-nowrap">
                  {nombreUsuario}
                </td>

                {/* Motivo */}
                <td className="px-3 py-2 border text-gray-700 max-w-xs break-words">
                  {item.motivo || "Sin motivo registrado"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TablaHistorialPrecio;