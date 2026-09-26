import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import ProductoService from "./producto-service";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));
vi.mock("../../../../utils/axiosConfig", () => ({ default: { apiUrl: "http://api.test/api" } }));
vi.mock("../../../../utils/crudFactory", () => ({ createCrudService: () => ({}) }));
vi.mock("../../../../utils/apiService", () => ({ default: {} }));

describe("ProductoService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("busca productos mobile con token y filtros", async () => {
    localStorage.setItem("Token", "jwt-token");
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [{ id: 5 }] });

    await expect(ProductoService.obtenerMobile({ lineaId: 3 })).resolves.toEqual([{ id: 5 }]);
    expect(axios.get).toHaveBeenCalledWith("http://api.test/api/producto/search-by-mobile", {
      headers: { Authorization: "Bearer jwt-token" },
      params: { lineaId: 3 },
    });
  });

  it("propaga fallos de búsqueda mobile", async () => {
    const error = new Error("offline");
    vi.mocked(axios.get).mockRejectedValueOnce(error);

    await expect(ProductoService.obtenerMobile({})).rejects.toBe(error);
  });

  it("actualiza precios y propaga errores", async () => {
    localStorage.setItem("Token", "jwt-token");
    const response = { data: { ok: true } };
    vi.mocked(axios.patch).mockResolvedValueOnce(response);
    await expect(ProductoService.actualizarPreciosProducto(4, { precio: 120 })).resolves.toBe(response);
    expect(axios.patch).toHaveBeenCalledWith("http://api.test/api/producto/4/precios", { precio: 120 }, {
      headers: { Authorization: "Bearer jwt-token" },
    });

    const error = new Error("conflict");
    vi.mocked(axios.patch).mockRejectedValueOnce(error);
    await expect(ProductoService.actualizarPreciosProducto(4, {})).rejects.toBe(error);
  });

  it("envía datos del cálculo por porcentaje y retorna null ante error", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { precio: 120 } });
    await expect(ProductoService.calcularPreciosConPorcentaje(8, 100, 10, 20, 30)).resolves.toEqual({ precio: 120 });
    expect(axios.post).toHaveBeenCalledWith("http://api.test/api/producto/calcular-precio-item", {
      productoId: 8,
      baseImponible: 100,
      porcentajeOcasional: 10,
      porcentajeMayorista: 20,
      porcentajeCliente: 30,
    }, expect.any(Object));

    vi.mocked(axios.post).mockRejectedValueOnce(new Error("bad request"));
    await expect(ProductoService.calcularPreciosConPorcentaje(8, 100, 10, 20, 30)).resolves.toBeNull();
  });

  it("calcula precios al crear producto y retorna null ante error", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { precioCliente: 121 } });
    await expect(ProductoService.calcularPreciosEnCrearProducto(21, 100, 10, 20, 30)).resolves.toEqual({ precioCliente: 121 });
    expect(axios.post).toHaveBeenCalledWith("http://api.test/api/producto/calcular-precio-item-from-nuevo", {
      alicuotaIva: 21,
      baseImponible: 100,
      porcentajeOcasional: 10,
      porcentajeMayorista: 20,
      porcentajeCliente: 30,
    }, expect.any(Object));

    vi.mocked(axios.post).mockRejectedValueOnce(new Error("bad request"));
    await expect(ProductoService.calcularPreciosEnCrearProducto(21, 100, 10, 20, 30)).resolves.toBeNull();
  });

  it("calcula el precio con flete y propaga el error", async () => {
    localStorage.setItem("Token", "jwt-token");
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { precioConFlete: 150 } });
    await expect(ProductoService.calcularPrecioConFlete(100, 1, 50)).resolves.toEqual({ precioConFlete: 150 });
    expect(axios.post).toHaveBeenCalledWith("http://api.test/api/producto/calcular-precio-con-flete", {
      precio: 100,
      tipo: 1,
      valor: 50,
    }, expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer jwt-token" }) }));

    vi.mocked(axios.post).mockRejectedValueOnce(new Error("offline"));
    await expect(ProductoService.calcularPrecioConFlete(100, 1, 50)).rejects.toThrow("offline");
  });

  it("valida el motivo antes de actualizar el precio y envía los datos válidos", async () => {
    await expect(ProductoService.actualizarPrecio(2, 100, 20, "  ", 7)).rejects.toThrow("motivo");
    expect(axios.patch).not.toHaveBeenCalled();

    await ProductoService.actualizarPrecio(2, 100, 20, "Revisión", 7);
    expect(axios.patch).toHaveBeenCalledWith("http://api.test/api/producto/2/precio", {
      costo: 100,
      porcentaje: 20,
      motivo: "Revisión",
      usuarioId: 7,
    }, expect.any(Object));
  });

  it("obtiene historial de precio y propaga errores", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [{ precioNuevo: 120 }] });
    await expect(ProductoService.obtenerHistorialPrecio(3)).resolves.toEqual([{ precioNuevo: 120 }]);
    expect(axios.get).toHaveBeenCalledWith("http://api.test/api/producto/3/historial-precio", { headers: {} });

    vi.mocked(axios.get).mockRejectedValueOnce(new Error("offline"));
    await expect(ProductoService.obtenerHistorialPrecio(3)).rejects.toThrow("offline");
  });
});