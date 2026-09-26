import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = vi.hoisted(() => ({
  obtener: vi.fn(),
  obtenerRapido: vi.fn(),
}));

vi.mock('../componentes/gestion-producto/producto/services/producto-service', () => ({
  default: {
    obtener: mocks.obtener,
    obtenerRapido: mocks.obtenerRapido,
    obtenerTotales: vi.fn(),
  },
}));
vi.mock('../context/filtros-contesxt', () => ({
  useFiltrosContext: () => ({
    setFiltrosNecesarios: vi.fn(),
    valoresFiltros: {},
    setValoresFiltros: vi.fn(),
    limpiarFiltros: vi.fn(),
    buscar: { cont: 0, componente: 'consultar-producto' },
    setBuscar: vi.fn(),
    setBusquedaRapida: vi.fn(),
  }),
}));
vi.mock('../context/catalogos-context', () => ({
  useCatalogosContext: () => ({ setLineas: vi.fn(), setMarcas: vi.fn(), setProveedores: vi.fn() }),
}));
vi.mock('../hooks/useFiltrosIniciales', () => ({ useFiltrosIniciales: () => ({}) }));
vi.mock('../componentes/sistema/ConfiguracionSistemaContext', () => ({
  useConfiguracionSistema: () => ({ configuracion: { caracteresParaBusqueda: 4 } }),
}));
vi.mock('../componentes/gestion-producto/producto/hooks/use-producto-impresion', () => ({
  useProductoImpresion: () => ({ handleImprimirTodo: vi.fn(), handleImprimirPagina: vi.fn() }),
}));
vi.mock('../componentes/herramientas/alertas/alertas', () => ({
  Alertas: () => null,
  TipoAlerta: { SUCCESS: 'success', ERROR: 'error' },
  TituloAlerta: { SUCCESS: 'Éxito', ERROR: 'Error' },
  useAlerts: () => ({ alerts: [], addAlert: vi.fn(), removeAlert: vi.fn() }),
}));
vi.mock('../componentes/herramientas/alertas/alertas-confirmacion', () => ({
  TipoAlertaConfirmacion: { DESTRUCTIVE: 'destructive' },
  TituloAlertaConfirmacion: { DESTRUCTIVE: 'Eliminar' },
  useConfirmation: () => ({ showConfirmation: vi.fn(), AlertasConfirmacion: () => null }),
}));
vi.mock('../componentes/gestion-producto/producto/componentes/header-producto', () => ({ ProductosHeader: () => null }));
vi.mock('../componentes/gestion-producto/producto/componentes/header-producto-lg', () => ({ ProductosHeaderLg: () => null }));
vi.mock('../componentes/gestion-producto/producto/componentes/datos-tabla', () => ({ DatosTabla: () => null }));
vi.mock('../componentes/gestion-producto/producto/componentes/datos-card', () => ({ DatosCard: () => null }));
vi.mock('../componentes/gestion-producto/producto/modales/producto-modales', () => ({ ProductosModales: () => null }));
vi.mock('../componentes/herramientas/reutilizables/filtros-aplicados', () => ({ default: () => null }));
vi.mock('../componentes/NotificacionModal/modales/NotificacionModal', () => ({ NotificacionModal: () => null }));
vi.mock('../utils/auth', () => ({ getRoles: () => ['Administrador'], getUsuarioId: () => 1 }));
vi.mock('../componentes/herramientas/reutilizables/paginacion', () => ({
  default: ({ onChange }: { onChange: (skip: number, take: number, pagina: number) => void }) =>
    <button onClick={() => onChange(10, 10, 2)}>Página 2</button>,
}));

import ConsultarProductos from '../componentes/gestion-producto/producto/utils/consultar-producto';

describe('CR-004 - Interfaz de búsqueda de productos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.obtener.mockResolvedValue({ data: [], total: 0 });
    mocks.obtenerRapido.mockResolvedValue({ data: [], total: 0 });
  });

  it('CA-C04 muestra una lista vacía con un mensaje y no como error', async () => {
    render(<ConsultarProductos />);

    expect(await screen.findByText('No se encontraron productos con los filtros ingresados')).toBeInTheDocument();
    expect(screen.queryByText(/No se pudieron cargar/)).not.toBeInTheDocument();
  });

  it('CA-C05 limpia simultáneamente denominación, Línea y SuperLínea', async () => {
    const user = userEvent.setup();
    render(<ConsultarProductos />);
    await screen.findByText('No se encontraron productos con los filtros ingresados');

    await user.type(screen.getByLabelText('Denominación del producto'), 'cola');
    await user.type(screen.getByLabelText('Línea'), 'gas');
    await user.type(screen.getByLabelText('SuperLínea'), 'beb');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => expect(mocks.obtener).toHaveBeenLastCalledWith(expect.objectContaining({
      denominacion: 'cola', lineaDenominacion: 'gas', superlineaDenominacion: 'beb',
    })));

    await user.click(screen.getByRole('button', { name: 'Limpiar' }));
    await waitFor(() => expect(mocks.obtener).toHaveBeenLastCalledWith(expect.objectContaining({
      denominacion: '', lineaDenominacion: '', superlineaDenominacion: '',
    })));
  });

  it('CA-C06 conserva los filtros al cambiar de página', async () => {
    const user = userEvent.setup();
    render(<ConsultarProductos />);
    await screen.findByText('No se encontraron productos con los filtros ingresados');

    await user.type(screen.getByLabelText('Denominación del producto'), 'cola');
    await user.type(screen.getByLabelText('Línea'), 'gas');
    await user.type(screen.getByLabelText('SuperLínea'), 'sin alcohol');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(screen.getByRole('button', { name: 'Página 2' }));

    await waitFor(() => expect(mocks.obtener).toHaveBeenLastCalledWith(expect.objectContaining({
      denominacion: 'cola', lineaDenominacion: 'gas', superlineaDenominacion: 'sin alcohol',
      skip: 10, take: 10,
    })));
  });

  it('CA-C07 vuelve a la primera página cuando se ejecuta una búsqueda nueva', async () => {
    const user = userEvent.setup();
    render(<ConsultarProductos />);
    await screen.findByText('No se encontraron productos con los filtros ingresados');

    await user.click(screen.getByRole('button', { name: 'Página 2' }));
    await user.type(screen.getByLabelText('Denominación del producto'), 'sprite');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => expect(mocks.obtener).toHaveBeenLastCalledWith(expect.objectContaining({
      denominacion: 'sprite', skip: 0, take: 10,
    })));
  });
});
