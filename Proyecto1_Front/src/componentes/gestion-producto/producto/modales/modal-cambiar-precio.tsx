import React, { useState, useId } from "react";
import ProductoService from "../services/producto-service"

interface ModalCambiarPrecioProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productoId: number;
  costoActual?: number;
  porcentajeActual?: number;
}

export const ModalCambiarPrecio: React.FC<ModalCambiarPrecioProps> = ({
  isOpen,
  onClose,
  onSuccess,
  productoId,
  costoActual = 0,
  porcentajeActual = 0,
}) => {
  const [costo, setCosto] = useState<number | "">(costoActual);
  const [porcentaje, setPorcentaje] = useState<number | "">(porcentajeActual);
  const [motivo, setMotivo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

  const costoId = useId();
  const porcentajeId = useId();
  const motivoId = useId();

  if (!isOpen) return null;

  const costoNumerico = typeof costo === "number" ? costo : 0;
  const porcentajeNumerico = typeof porcentaje === "number" ? porcentaje : 0;
  const precioCalculado = costoNumerico * (1 + porcentajeNumerico / 100);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (precioCalculado <= 0) {
      setError("El precio resultante debe ser mayor a 0.");
      return;
    }

    if (!motivo || motivo.trim() === "") {
      setError("Debe ingresar un motivo para registrar el cambio.");
      return;
    }

    try {
      setCargando(true);

      const usuarioId = Number(localStorage.getItem("UsuarioId")) || 1;

      await ProductoService.actualizarPrecio(
        productoId,
        costoNumerico,
        porcentajeNumerico,
        motivo.trim(),
        usuarioId
      );

      setMotivo("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Error al actualizar el precio");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <h2>Actualizar Precio</h2>

        {error && (
          <div style={{ color: "red", marginBottom: "12px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleGuardar}>
          {/* Input Numérico: Costo */}
          <div style={fieldStyle}>
            <label htmlFor={costoId}>Costo base:</label>
            <input
              id={costoId}
              type="number"
              min="0"
              step="0.01"
              value={costo}
              onChange={(e) => setCosto(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0.00"
              required
              style={inputStyle}
            />
          </div>

          {/* Input Numérico: Porcentaje de ganancia */}
          <div style={fieldStyle}>
            <label htmlFor={porcentajeId}>Margen / Porcentaje (%):</label>
            <input
              id={porcentajeId}
              type="number"
              step="0.01"
              value={porcentaje}
              onChange={(e) => setPorcentaje(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              required
              style={inputStyle}
            />
          </div>

          {/* Precio Final Calculado */}
          <div style={previewBoxStyle}>
            <span>Nuevo precio calculado:</span>
            <strong>${precioCalculado.toFixed(2)}</strong>
          </div>

          {/* Textarea: Motivo */}
          <div style={fieldStyle}>
            <label htmlFor={motivoId}>Motivo del cambio (obligatorio):</label>
            <textarea
              id={motivoId}
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Aumento del proveedor, ajuste inflacionario..."
              required
              style={inputStyle}
            />
          </div>

          {/* Botones de acción */}
          <div style={actionsStyle}>
            <button
              type="button"
              onClick={onClose}
              disabled={cargando}
              style={{ ...buttonStyle, backgroundColor: "#ccc" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              style={{ ...buttonStyle, backgroundColor: "#007bff", color: "#fff" }}
            >
              {cargando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Estilos básicos en línea (puedes cambiarlos por tus clases CSS, Tailwind o Bootstrap)
const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "8px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "14px",
  gap: "4px",
};

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const previewBoxStyle: React.CSSProperties = {
  backgroundColor: "#f4f4f4",
  padding: "10px",
  borderRadius: "4px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "14px",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "16px",
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
  fontSize: "14px",
};

export default ModalCambiarPrecio;