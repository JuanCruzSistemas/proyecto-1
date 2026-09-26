import { Presentacion } from "../../../../interfaces/gestion-producto/presentacion/interfaces-presentacion";
import { PresentacionModalTipo } from "../hooks/use-presentacion-modal";
import RegistrarActualizarPresentacionForm from "../utils/registrar-actualizar-presentacion";

interface Props {
  open: boolean;
  tipo: PresentacionModalTipo;
  presentacion?: Presentacion | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export function PresentacionModal({ open, tipo, presentacion, onClose, onSuccess }: Props) {
  if (!open || !tipo) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        {tipo === "alta" && (
          <RegistrarActualizarPresentacionForm onClose={onClose} onSuccess={onSuccess} />
        )}
        {tipo === "edicion" && presentacion && (
          <RegistrarActualizarPresentacionForm
            presentacion={presentacion}
            onClose={onClose}
            onSuccess={onSuccess}
          />
        )}
      </div>
    </div>
  );
}
