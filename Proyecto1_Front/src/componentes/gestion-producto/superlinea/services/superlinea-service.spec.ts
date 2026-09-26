import { beforeEach, describe, expect, it, vi } from 'vitest'
import ApiService from '../../../../utils/apiService'
import SuperlineaService from './superlinea-service'

vi.mock('../../../../utils/apiService', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

const api = vi.mocked(ApiService)

describe('SuperlineaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('listar() consulta GET /superlinea y devuelve la respuesta', async () => {
    const lista = [{ id: 1, denominacion: 'Bebidas', observacion: null, sistema: 0 }]
    api.get.mockResolvedValue(lista)

    await expect(SuperlineaService.listar()).resolves.toEqual(lista)
    expect(api.get).toHaveBeenCalledWith('/superlinea')
  })

  it('crear() envía el payload por POST /superlinea', async () => {
    const payload = { denominacion: 'Bebidas', observacion: null }
    api.post.mockResolvedValue({ id: 5, ...payload, sistema: 0 })

    await expect(SuperlineaService.crear(payload)).resolves.toEqual({ id: 5, ...payload, sistema: 0 })
    expect(api.post).toHaveBeenCalledWith('/superlinea', payload)
  })

  it('actualizar() envía el payload por PUT /superlinea/:id', async () => {
    const payload = { denominacion: 'Lácteos', observacion: 'obs' }
    api.put.mockResolvedValue({ id: 3, ...payload, sistema: 0 })

    await SuperlineaService.actualizar(3, payload)

    expect(api.put).toHaveBeenCalledWith('/superlinea/3', payload)
  })

  it('eliminar() llama a DELETE /superlinea/:id', async () => {
    api.delete.mockResolvedValue({ mensaje: 'SuperLínea dada de baja.' })

    await expect(SuperlineaService.eliminar(8)).resolves.toEqual({ mensaje: 'SuperLínea dada de baja.' })
    expect(api.delete).toHaveBeenCalledWith('/superlinea/8')
  })

  it('propaga los errores de la API', async () => {
    const error = { response: { status: 409, data: { message: 'Conflicto' } } }
    api.delete.mockRejectedValue(error)

    await expect(SuperlineaService.eliminar(8)).rejects.toBe(error)
  })
})
