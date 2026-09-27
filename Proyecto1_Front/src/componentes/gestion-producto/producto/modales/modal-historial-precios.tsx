import React from "react";
import { TablaHistorialPrecio } from "../componentes/tabla-historial-precio";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Historial de Precios {nombreProducto ? `— ${nombreProducto}` : ""}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        {/* Contenido / Tabla */}
        <div className="p-6 overflow-y-auto flex-1">
          <TablaHistorialPrecio productoId={productoId} />
        </div>

        {/* Pie */}
        <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalHistorialPrecios;
