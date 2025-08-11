import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Funciones para formatear números paraguayos (Guaraníes)
export function formatParaguayanCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseInt(value.replace(/\./g, '')) : value
  if (isNaN(numValue)) return ''
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
