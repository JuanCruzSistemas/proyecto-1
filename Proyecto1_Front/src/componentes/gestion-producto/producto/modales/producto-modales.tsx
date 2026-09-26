import { Producto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";
import InformacionAuditoria from "../../../herramientas/reutilizables/informacion-auditoria";
import RegistrarActualizarProductoForm from "../utils/registrar-actualizar-producto";
import ModalCambiarPrecio from "./modal-cambiar-precio";
import ModalHistorialPrecios from "./modal-historial-precios"; 
import {TablaHistorialPrecio} from "../componentes/tabla-historial-precio";

interface Props {
  isAltaOpen: boolean;
  mostrarActualizarProducto: boolean;
    mostrarInfoAuditoria: boolean;
    mostrarMovimientosStock: boolean;
    mostrarHistorialPrecios: boolean;
    mostrarCambioPrecios: boolean;
    mostrarProductosAlternativos: boolean;
    mostrarDeQuienEsAlternativo: boolean;
    productoSeleccionado: Producto | null;
    productoInfo: any;
    auditoria: any;
  onCloseAlta: () => void;
    onCloseActualizar: () => void;
    onCloseAuditoria: () => void;
    onCloseMovimientosStock: () => void;
    onCloseHistorialPrecios: () => void;
    onCloseCambioPrecios: () => void;
    onCloseProductosAlternativos: () => void;
    onCloseDeQuienEsAlternativo: () => void;
  onSuccessAlta: (mensaje: string, producto?: Producto) => void;
    onSuccessActualizar: (mensaje: string) => void;
    onRefetch: () => void;
}

export function ProductosModales({
  isAltaOpen,
  mostrarActualizarProducto,
  mostrarInfoAuditoria,
  mostrarMovimientosStock,
  mostrarHistorialPrecios,
  mostrarCambioPrecios,
  mostrarProductosAlternativos,
  mostrarDeQuienEsAlternativo,
  productoSeleccionado,
  productoInfo,
  auditoria,
  onCloseAlta,
  onCloseActualizar,
  onCloseAuditoria,
  onCloseMovimientosStock,
  onCloseHistorialPrecios,
  onCloseCambioPrecios,
  onCloseProductosAlternativos,
  onCloseDeQuienEsAlternativo,
  onSuccessAlta,
  onSuccessActualizar,
  onRefetch,
}: Props) {
  return (
    <>
      {isAltaOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RegistrarActualizarProductoForm
            onClose={onCloseAlta}
            onSuccess={onSuccessAlta}
          />
        </div>
      )}

      {mostrarActualizarProducto && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RegistrarActualizarProductoForm
            producto={productoSeleccionado}
            onClose={onCloseActualizar}
            onSuccess={onSuccessActualizar}
          />
        </div>
      )}

      {mostrarInfoAuditoria && auditoria && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <InformacionAuditoria auditoria={auditoria} onClose={onCloseAuditoria} />
        </div>
      )}

      {mostrarCambioPrecios && productoSeleccionado && (
        <ModalCambiarPrecio
          isOpen={mostrarCambioPrecios}
          productoId={(productoSeleccionado as any).id || (productoSeleccionado as any).productoId}
          costoActual={productoSeleccionado.costo || 0}
          porcentajeActual={(productoSeleccionado as any).porcentajeGanancia || 0}
          onClose={onCloseCambioPrecios}
          onSuccess={() => {
            onRefetch();
            onSuccessActualizar("Precio actualizado con éxito");
          }}
        />
      )}

      {mostrarHistorialPrecios && productoSeleccionado && (
        <ModalHistorialPrecios
          isOpen={mostrarHistorialPrecios}
          productoId={(productoSeleccionado as any).id || (productoSeleccionado as any).productoId}
          nombreProducto={(productoSeleccionado as any).nombre}
          onClose={onCloseHistorialPrecios}
        />
      )}

      {isAltaOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RegistrarActualizarProductoForm
            onClose={onCloseAlta}
            onSuccess={onSuccessAlta}
          />
        </div>
      )} 

      {mostrarActualizarProducto && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RegistrarActualizarProductoForm
            producto={productoSeleccionado}
            onClose={onCloseActualizar}
            onSuccess={onSuccessActualizar}
          />
        </div>
      )}

      {mostrarInfoAuditoria && auditoria && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <InformacionAuditoria auditoria={auditoria} onClose={onCloseAuditoria} />
        </div>
      )}

      {mostrarCambioPrecios && productoSeleccionado && (
        <ModalCambiarPrecio
          isOpen={mostrarCambioPrecios}
          productoId={(productoSeleccionado as any).id || (productoSeleccionado as any).productoId}
          costoActual={productoSeleccionado.costo || 0}
          porcentajeActual={(productoSeleccionado as any).porcentajeGanancia || 0}
          onClose={onCloseCambioPrecios}
          onSuccess={() => {
            onRefetch();
            onSuccessActualizar("Precio actualizado con éxito");
          }}
        />
      )}
      {mostrarHistorialPrecios && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Historial de Precios
            </h3>
            <button
            type="button"
            onClick={onCloseHistorialPrecios}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ✕
              </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <TablaHistorialPrecio
                productoId={Number(productoSeleccionado.id ?? (productoSeleccionado as any).productoId)}
                />
                </div>
                <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
                  <button
                  type="button"
                  onClick={onCloseHistorialPrecios}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                  >
                    Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
}
