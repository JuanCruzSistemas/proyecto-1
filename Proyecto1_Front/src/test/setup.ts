import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// AlertasConfirmacion deja un setTimeout de 200ms para la animación de cierre.
// Se espera a que termine antes de desmontar el entorno jsdom del archivo.
afterAll(() => new Promise((resolve) => setTimeout(resolve, 250)))