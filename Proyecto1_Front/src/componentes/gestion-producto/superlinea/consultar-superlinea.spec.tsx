import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConsultarSuperlinea from './consultar-superlinea'
import SuperlineaService, { SuperlineaResumen } from './services/superlinea-service'

vi.mock('./services/superlinea-service', () => ({
  default: {
    listar: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
  },
}))

const service = vi.mocked(SuperlineaService)

const bebidas: SuperlineaResumen = { id: 1, denominacion: 'Bebidas', observacion: 'Frías', sistema: 0 }
const lacteos: SuperlineaResumen = { id: 2, denominacion: 'Lácteos', observacion: null, sistema: 0 }
const general: SuperlineaResumen = { id: 3, denominacion: 'General', observacion: null, sistema: 1 }

const apiError = (message: string) => ({ response: { data: { message } } })

const renderizar = async (filas: SuperlineaResumen[] = [bebidas, lacteos]) => {
  service.listar.mockResolvedValue(filas)
  const user = userEvent.setup()
  render(<ConsultarSuperlinea />)
  await waitFor(() => expect(screen.queryByText('Cargando SuperLíneas…')).not.toBeInTheDocument())
  return user
}

const inputDenominacion = () => screen.getByLabelText('Denominación *')
const inputObservacion = () => screen.getByLabelText('Observación')

describe('ConsultarSuperlinea', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listado', () => {
    it('muestra el indicador de carga mientras consulta', async () => {
      service.listar.mockReturnValue(new Promise(() => {}))
      render(<ConsultarSuperlinea />)

      expect(screen.getByText('Cargando SuperLíneas…')).toBeInTheDocument()
    })

    it('muestra las superlíneas activas con su observación', async () => {
      await renderizar()

      const filas = screen.getAllByRole('row')
      expect(filas).toHaveLength(3) // encabezado + 2
      expect(within(filas[1]).getByText('Bebidas')).toBeInTheDocument()
      expect(within(filas[1]).getByText('Frías')).toBeInTheDocument()
      expect(within(filas[2]).getByText('Lácteos')).toBeInTheDocument()
      expect(within(filas[2]).getByText('—')).toBeInTheDocument()
      expect(service.listar).toHaveBeenCalledTimes(1)
    })

    it('muestra un mensaje cuando no hay superlíneas', async () => {
      await renderizar([])

      expect(screen.getByText(/No hay SuperLíneas activas/)).toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('deshabilita editar y dar de baja en las superlíneas del sistema', async () => {
      await renderizar([bebidas, general])

      expect(screen.getByRole('button', { name: 'Editar General' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Dar de baja General' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Editar Bebidas' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Dar de baja Bebidas' })).toBeEnabled()
    })

    it('si falla la carga muestra el error y permite reintentar', async () => {
      service.listar.mockRejectedValueOnce(apiError('Servidor no disponible')).mockResolvedValueOnce([bebidas])
      const user = userEvent.setup()
      render(<ConsultarSuperlinea />)

      expect(await screen.findByText('Servidor no disponible')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Volver a cargar' }))

      expect(await screen.findByText('Bebidas')).toBeInTheDocument()
      expect(screen.queryByText('Servidor no disponible')).not.toBeInTheDocument()
      expect(service.listar).toHaveBeenCalledTimes(2)
    })

    it('ante un error sin respuesta del servidor muestra un mensaje genérico', async () => {
      service.listar.mockRejectedValue(new Error('Network Error'))
      render(<ConsultarSuperlinea />)

      expect(await screen.findByText('Ocurrió un error inesperado.')).toBeInTheDocument()
    })
  })

  describe('alta', () => {
    it('abre el formulario vacío en modo creación', async () => {
      const user = await renderizar()

      await user.click(screen.getByRole('button', { name: /Nueva SuperLínea/ }))

      expect(screen.getByRole('heading', { name: 'Crear SuperLínea' })).toBeInTheDocument()
      expect(inputDenominacion()).toHaveValue('')
      expect(inputObservacion()).toHaveValue('')
    })

    it('valida que la denominación sea obligatoria sin llamar a la API', async () => {
      const user = await renderizar()
      await user.click(screen.getByRole('button', { name: /Nueva SuperLínea/ }))

      await user.type(inputDenominacion(), '   ')
      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(screen.getByText('La denominación es obligatoria.')).toBeInTheDocument()
      expect(inputDenominacion()).toHaveAttribute('aria-invalid', 'true')
      expect(service.crear).not.toHaveBeenCalled()
    })

    it('valida el máximo de 255 caracteres', async () => {
      const user = await renderizar()
      await user.click(screen.getByRole('button', { name: /Nueva SuperLínea/ }))

      // El input tiene maxLength, así que se fuerza el valor como si llegara por pegado/autocompletado.
      fireEvent.change(inputDenominacion(), { target: { value: 'a'.repeat(256) } })
      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(screen.getByText('La denominación admite hasta 255 caracteres.')).toBeInTheDocument()
      expect(service.crear).not.toHaveBeenCalled()
    })

    it('crea con datos recortados, informa el éxito y recarga el listado', async () => {
      const user = await renderizar()
      service.crear.mockResolvedValue({ id: 9, denominacion: 'Snacks', observacion: null, sistema: 0 })
      service.listar.mockResolvedValue([bebidas, lacteos, { id: 9, denominacion: 'Snacks', observacion: null, sistema: 0 }])

      await user.click(screen.getByRole('button', { name: /Nueva SuperLínea/ }))
      await user.type(inputDenominacion(), '  Snacks  ')
      await user.type(inputObservacion(), '   ')
      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(await screen.findByText('SuperLínea creada.')).toBeInTheDocument()
      expect(service.crear).toHaveBeenCalledWith({ denominacion: 'Snacks', observacion: null })
      expect(service.actualizar).not.toHaveBeenCalled()
      expect(screen.queryByRole('heading', { name: 'Crear SuperLínea' })).not.toBeInTheDocument()
      expect(await screen.findByText('Snacks')).toBeInTheDocument()
      expect(service.listar).toHaveBeenCalledTimes(2)
    })

    it('mientras guarda deshabilita el formulario y muestra "Guardando…"', async () => {
      const user = await renderizar()
      let resolver: (v: SuperlineaResumen) => void = () => {}
      service.crear.mockReturnValue(new Promise((r) => { resolver = r }))

      await user.click(screen.getByRole('button', { name: /Nueva SuperLínea/ }))
      await user.type(inputDenominacion(), 'Snacks')
      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(screen.getByRole('button', { name: 'Guardando…' })).toBeInTheDocument()
      expect(inputDenominacion()).toBeDisabled()
      expect(screen.getByRole('button', { name: /Nueva SuperLínea/ })).toBeDisabled()

      resolver({ id: 9, denominacion: 'Snacks', observacion: null, sistema: 0 })
      expect(await screen.findByText('SuperLínea creada.')).toBeInTheDocument()
    })

    it('si la API rechaza el alta muestra el error y mantiene el formulario abierto', async () => {
      const user = await renderizar()
      service.crear.mockRejectedValue(apiError('La denominación ya existe'))

      await user.click(screen.getByRole('button', { name: /Nueva SuperLínea/ }))
      await user.type(inputDenominacion(), 'Bebidas')
      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(await screen.findByText('La denominación ya existe')).toBeInTheDocument()
      expect(inputDenominacion()).toHaveValue('Bebidas')
      expect(inputDenominacion()).toBeEnabled()
      expect(service.listar).toHaveBeenCalledTimes(1)
    })

    it('muestra todos los mensajes de validación que devuelve el backend', async () => {
      const user = await renderizar()
      service.crear.mockRejectedValue({ response: { data: { message: ['error uno', 'error dos'] } } })

      await user.click(screen.getByRole('button', { name: /Nueva SuperLínea/ }))
      await user.type(inputDenominacion(), 'X')
      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(await screen.findByText('error uno, error dos')).toBeInTheDocument()
    })

    it('cancelar cierra el formulario sin guardar', async () => {
      const user = await renderizar()
      await user.click(screen.getByRole('button', { name: /Nueva SuperLínea/ }))
      await user.type(inputDenominacion(), 'Algo')

      await user.click(screen.getByRole('button', { name: 'Cancelar' }))

      expect(screen.queryByLabelText('Denominación *')).not.toBeInTheDocument()
      expect(service.crear).not.toHaveBeenCalled()
    })
  })

  describe('edición', () => {
    it('abre el formulario con los datos de la fila', async () => {
      const user = await renderizar()

      await user.click(screen.getByRole('button', { name: 'Editar Bebidas' }))

      expect(screen.getByRole('heading', { name: 'Editar SuperLínea' })).toBeInTheDocument()
      expect(inputDenominacion()).toHaveValue('Bebidas')
      expect(inputObservacion()).toHaveValue('Frías')
    })

    it('una fila sin observación abre el campo vacío', async () => {
      const user = await renderizar()
      await user.click(screen.getByRole('button', { name: 'Editar Lácteos' }))
      expect(inputObservacion()).toHaveValue('')
    })

    it('actualiza la superlínea editada e informa el éxito', async () => {
      const user = await renderizar()
      service.actualizar.mockResolvedValue({ ...bebidas, denominacion: 'Bebidas sin alcohol' })

      await user.click(screen.getByRole('button', { name: 'Editar Bebidas' }))
      await user.clear(inputDenominacion())
      await user.type(inputDenominacion(), 'Bebidas sin alcohol')
      await user.clear(inputObservacion())
      await user.type(inputObservacion(), ' Nueva obs ')
      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      expect(await screen.findByText('SuperLínea actualizada.')).toBeInTheDocument()
      expect(service.actualizar).toHaveBeenCalledWith(1, { denominacion: 'Bebidas sin alcohol', observacion: 'Nueva obs' })
      expect(service.crear).not.toHaveBeenCalled()
      expect(service.listar).toHaveBeenCalledTimes(2)
    })

    it('al abrir el formulario limpia los mensajes previos', async () => {
      const user = await renderizar()
      service.actualizar.mockResolvedValue(bebidas)
      await user.click(screen.getByRole('button', { name: 'Editar Bebidas' }))
      await user.click(screen.getByRole('button', { name: 'Guardar' }))
      expect(await screen.findByText('SuperLínea actualizada.')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Editar Lácteos' }))

      expect(screen.queryByText('SuperLínea actualizada.')).not.toBeInTheDocument()
    })
  })

  describe('baja', () => {
    it('pide confirmación mostrando la denominación', async () => {
      const user = await renderizar()

      await user.click(screen.getByRole('button', { name: 'Dar de baja Bebidas' }))

      const dialogo = await screen.findByRole('dialog')
      expect(within(dialogo).getByText(/¿Dar de baja la SuperLínea “Bebidas”\?/)).toBeInTheDocument()
    })

    it('si se cancela la confirmación no elimina', async () => {
      const user = await renderizar()
      await user.click(screen.getByRole('button', { name: 'Dar de baja Bebidas' }))
      const dialogo = await screen.findByRole('dialog')

      await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }))

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(service.eliminar).not.toHaveBeenCalled()
      expect(service.listar).toHaveBeenCalledTimes(1)
    })

    it('al confirmar elimina, informa y recarga el listado', async () => {
      const user = await renderizar()
      service.eliminar.mockResolvedValue({ mensaje: 'ok' })
      service.listar.mockResolvedValue([lacteos])

      await user.click(screen.getByRole('button', { name: 'Dar de baja Bebidas' }))
      const dialogo = await screen.findByRole('dialog')
      await user.click(within(dialogo).getByRole('button', { name: 'Dar de baja' }))

      expect(await screen.findByText('SuperLínea dada de baja.')).toBeInTheDocument()
      expect(service.eliminar).toHaveBeenCalledWith(1)
      await waitFor(() => expect(screen.queryByText('Bebidas')).not.toBeInTheDocument())
      expect(service.listar).toHaveBeenCalledTimes(2)
    })

    it('si la API rechaza la baja muestra el motivo', async () => {
      const user = await renderizar()
      service.eliminar.mockRejectedValue(apiError('No se puede eliminar: tiene líneas activas asociadas.'))

      await user.click(screen.getByRole('button', { name: 'Dar de baja Bebidas' }))
      const dialogo = await screen.findByRole('dialog')
      await user.click(within(dialogo).getByRole('button', { name: 'Dar de baja' }))

      expect(await screen.findByText('No se puede eliminar: tiene líneas activas asociadas.')).toBeInTheDocument()
      expect(screen.queryByText('SuperLínea dada de baja.')).not.toBeInTheDocument()
      expect(screen.getByText('Bebidas')).toBeInTheDocument()
    })
  })
})
