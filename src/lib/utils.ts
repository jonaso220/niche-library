import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(brand: string, name: string, concentration?: string): string {
  const parts = [brand, name, concentration].filter(Boolean)
  return parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function formatUYU(amount: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const SEASON_LABELS: Record<string, string> = {
  spring: 'Primavera',
  summer: 'Verano',
  fall: 'Otoño',
  winter: 'Invierno',
}

export const OCCASION_LABELS: Record<string, string> = {
  professional: 'Profesional',
  casual: 'Casual',
  nightOut: 'Noche',
  date: 'Cita',
  special: 'Especial',
}
