import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import CambioPreciosMasivoService from "./lista-precios-service";

vi.mock("axios", () => ({ default: { patch: vi.fn(), post: vi.fn() } }));
vi.mock("../../../../../utils/axiosConfig", () => ({ default: { apiUrl: "http://api.test/api" } }));
vi.mock("../../../../../utils/crudFactory", () => ({ createCrudService: () => ({}) }));
vi.mock("../../../../../utils/apiService", () => ({ default: {} }));

describe("ListaPreciosService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("aplica y guarda cambios usando endpoints masivos", async () => {
    vi.mocked(axios.patch)
      .mockResolvedValueOnce({ data: [{ id: 1, precioNuevo: 110 }] })
      .mockResolvedValueOnce({ data: { mensaje: "Guardado" } });

    await expect(CambioPreciosMasivoService.aplicarCambios({ valor: 10, tipoActualizacion: "PORCENTAJE" }))
      .resolves.toEqual([{ id: 1, precioNuevo: 110 }]);
    await expect(CambioPreciosMasivoService.guardarCambios({ items: [], usuarioCreatedId: 1 }))
      .resolves.toEqual({ mensaje: "Guardado" });
    expect(axios.patch).toHaveBeenNthCalledWith(1, "http://api.test/api/cambio-precios/aplicar-cambios", {
      valor: 10,
      tipoActualizacion: "PORCENTAJE",
    }, { headers: {} });
  });

  it("descarga la lista en PDF y propaga errores HTTP", async () => {
    const pdf = new Blob(["pdf"]);
    vi.mocked(axios.post).mockResolvedValueOnce({ data: pdf });
    await expect(CambioPreciosMasivoService.imprimirListaPrecios({ lineaId: 3 })).resolves.toBe(pdf);

    const error = new Error("no existe endpoint");
    vi.mocked(axios.post).mockRejectedValueOnce(error);
    await expect(CambioPreciosMasivoService.imprimirListaPrecios({})).rejects.toBe(error);
  });
});