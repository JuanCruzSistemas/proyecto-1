import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FiltrosSimple } from './filtros-simple';

describe('FiltrosSimple usado por Línea y Presentación', () => {
  it('envía la denominación escrita al presionar Buscar', async () => {
    const user = userEvent.setup();
    const onBuscar = vi.fn();
    render(<FiltrosSimple onBuscar={onBuscar} />);
    await user.click(screen.getByRole('button', { name: /filtros/i }));
    await user.type(screen.getByPlaceholderText('Buscar por denominación...'), 'beb');
    await user.click(screen.getByRole('button', { name: /buscar/i }));
    expect(onBuscar).toHaveBeenCalledWith({ denominacion: 'beb' });
    expect(screen.getByText('beb')).toBeInTheDocument();
  });

  it('permite buscar con Enter y limpiar el filtro aplicado', async () => {
    const user = userEvent.setup();
    const onBuscar = vi.fn();
    render(<FiltrosSimple onBuscar={onBuscar} />);
    await user.click(screen.getByRole('button', { name: /filtros/i }));
    const input = screen.getByPlaceholderText('Buscar por denominación...');
    await user.type(input, 'pack{Enter}');
    expect(onBuscar).toHaveBeenLastCalledWith({ denominacion: 'pack' });
    const clear = screen.getByText('pack').parentElement?.querySelector('button');
    expect(clear).not.toBeNull();
    await user.click(clear!);
    expect(onBuscar).toHaveBeenLastCalledWith({ denominacion: '' });
  });

  it('incluye el indicador de eliminados solo cuando el consumidor lo habilita', async () => {
    const user = userEvent.setup();
    const onBuscar = vi.fn();
    render(<FiltrosSimple onBuscar={onBuscar} mostrarIncluirEliminados />);
    await user.click(screen.getByRole('button', { name: /filtros/i }));
    await user.click(screen.getByLabelText('Incluir eliminados'));
    await user.click(screen.getByRole('button', { name: /buscar/i }));
    expect(onBuscar).toHaveBeenCalledWith({ denominacion: '', incluirEliminados: true });
    expect(screen.getByText('Incluye eliminados')).toBeInTheDocument();
  });
});
