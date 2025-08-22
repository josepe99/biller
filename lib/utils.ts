import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Función para truncar decimales y formatear como moneda paraguaya
export function formatParaguayanCurrency(value: number | string): string {
  // Convert to number, truncate decimals, and format with dots
  let numValue = typeof value === 'string' ? Number(value.replace(/\./g, '').replace(/,/g, '.')) : value
  if (isNaN(numValue)) return ''
  numValue = Math.trunc(numValue) // Remove decimals
  return `Gs ${numValue.toLocaleString('es-PY').replace(/,/g, '.')}`
}

export function parseParaguayanCurrency(value: string): number {
  // Remover 'Gs', espacios y convertir puntos a números
  const cleanValue = value.replace(/[Gs\s]/g, '').replace(/\./g, '')
  return parseInt(cleanValue) || 0
}

export function formatNumberWithDots(value: number | string): string {
  const numValue = typeof value === 'string' ? parseInt(value.replace(/\./g, '')) : value
  if (isNaN(numValue)) return ''
  return numValue.toLocaleString('es-PY').replace(/,/g, '.')
}
