import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import CambioPreciosMasivoService from "./cambio-precios-masivo-service";

vi.mock("axios", () => ({ default: { patch: vi.fn(), post: vi.fn() } }));
vi.mock("../../../../utils/axiosConfig", () => ({ default: { apiUrl: "http://api.test/api" } }));
vi.mock("../../../../utils/crudFactory", () => ({ createCrudService: () => ({}) }));

describe("CambioPreciosMasivoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("aplica cambios con el token de sesión", async () => {
    localStorage.setItem("Token", "jwt");
    vi.mocked(axios.patch).mockResolvedValueOnce({ data: [{ id: 1, precioNuevo: 110 }] });
    const payload = { items: [{ id: 1, precio: 100 }], valor: 10, tipoActualizacion: "PORCENTAJE" };

    await expect(CambioPreciosMasivoService.aplicarCambios(payload)).resolves.toEqual([{ id: 1, precioNuevo: 110 }]);
    expect(axios.patch).toHaveBeenCalledWith("http://api.test/api/cambio-precios/aplicar-cambios", payload, {
      headers: { Authorization: "Bearer jwt" },
    });
  });

  it("guarda cambios, permite monto firmado y propaga errores", async () => {
    const payload = { items: [{ id: 1, precioNuevo: 90 }], usuarioCreatedId: 7 };
    vi.mocked(axios.patch).mockResolvedValueOnce({ data: { mensaje: "Guardado" } });
    await expect(CambioPreciosMasivoService.guardarCambios(payload)).resolves.toEqual({ mensaje: "Guardado" });
    expect(axios.patch).toHaveBeenCalledWith("http://api.test/api/cambio-precios/guardar-cambios", payload, {
      headers: {},
    });

    const error = new Error("precio inválido");
    vi.mocked(axios.patch).mockRejectedValueOnce(error);
    await expect(CambioPreciosMasivoService.aplicarCambios(payload)).rejects.toBe(error);
  });

  it("propaga errores al guardar un lote", async () => {
    const error = new Error("transacción rechazada");
    vi.mocked(axios.patch).mockRejectedValueOnce(error);

    await expect(CambioPreciosMasivoService.guardarCambios({ items: [], usuarioCreatedId: 4 })).rejects.toBe(error);
    expect(axios.patch).toHaveBeenCalledWith(
      "http://api.test/api/cambio-precios/guardar-cambios",
      { items: [], usuarioCreatedId: 4 },
      { headers: {} },
    );
  });
});