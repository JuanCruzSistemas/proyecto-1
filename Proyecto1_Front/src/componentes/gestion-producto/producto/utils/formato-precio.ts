export const formatearPrecio = (precio: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(precio)
}

export const calcularDiferenciaPorcentual = (
  anterior: number,
  nuevo: number
): number => {
  return ((nuevo - anterior) / anterior) * 100
}
