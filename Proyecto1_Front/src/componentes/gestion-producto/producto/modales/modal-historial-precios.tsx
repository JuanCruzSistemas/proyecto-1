import React, { useEffect, useState } from "react";
import ProductoService from "../services/producto-service";

interface HistorialItem {
  id?: number;
  costo: number;
  porcentajeGanancia?: number;
  precioFinal?: number;
  motivo: string;
  fechaCreacion?: string;
  fecha?: string;
  usuario?: string;
}

interface ModalHistorialPreciosProps {
  isOpen: boolean;
  onClose: () => void;
  productoId: number;
  nombreProducto?: string;
}

export const ModalHistorialPrecios: React.FC<ModalHistorialPreciosProps> = ({
  isOpen,
  onClose,
  productoId,
  nombreProducto,
}) => {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && productoId) {
      cargarHistorial();
    }
  }, [isOpen, productoId]);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      setError(null);
      const res: any = await ProductoService.obtenerHistorialPrecio(productoId);
      setHistorial(Array.isArray(res) ? res : res?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "No se pudo cargar el historial.");
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">
            Historial de Precios {nombreProducto ? `— ${nombreProducto}` : ""}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Contenido / Tabla */}
        <div className="p-4 overflow-y-auto flex-1">
          {cargando && <p className="text-center text-gray-500 py-6">Cargando historial...</p>}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {!cargando && !error && historial.length === 0 && (
            <p className="text-center text-gray-500 py-6">
              No hay registros de cambios de precio para este producto.
            </p>
          )}

          {!cargando && historial.length > 0 && (
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs sticky top-0">
                <tr>
                  <th className="p-2 border-b">Fecha</th>
                  <th className="p-2 border-b text-right">Costo</th>
                  <th className="p-2 border-b text-right">Margen</th>
                  <th className="p-2 border-b">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((item, idx) => (
                  <tr key={item.id || idx} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-gray-600 whitespace-nowrap">
                      {item.fechaCreacion || item.fecha
                        ? new Date(item.fechaCreacion || item.fecha!).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-2 text-right font-medium">
                      ${Number(item.costo).toFixed(2)}
                    </td>
                    <td className="p-2 text-right text-gray-600">
                      {item.porcentajeGanancia != null ? `${item.porcentajeGanancia}%` : "-"}
                    </td>
                    <td className="p-2 text-gray-700 max-w-xs break-words">
                      {item.motivo || "Sin motivo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pie */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalHistorialPrecios;