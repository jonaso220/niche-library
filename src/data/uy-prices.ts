import type { Concentration, PriceEstimate } from '@/types/perfume'

interface UYPriceEntry {
  brand: string
  concentration?: Concentration
  minUYU: number
  maxUYU: number
  source: string
  lastUpdated: string
}

const uyPrices: UYPriceEntry[] = [
  // Niche - Precios altos
  { brand: 'Creed', minUYU: 18000, maxUYU: 28000, source: 'Duty Free Montevideo', lastUpdated: '2026-02-01' },
  { brand: 'Tom Ford', minUYU: 12000, maxUYU: 22000, source: 'Duty Free / Tienda Inglesa', lastUpdated: '2026-02-01' },
  { brand: 'Xerjoff', minUYU: 15000, maxUYU: 25000, source: 'Estimado importación', lastUpdated: '2026-02-01' },
  { brand: 'Maison Francis Kurkdjian', minUYU: 16000, maxUYU: 26000, source: 'Estimado importación', lastUpdated: '2026-02-01' },
  { brand: 'MFK', minUYU: 16000, maxUYU: 26000, source: 'Estimado importación', lastUpdated: '2026-02-01' },

  // Designer Premium
  { brand: 'Dior', minUYU: 6500, maxUYU: 12000, source: 'Duty Free / Ta-Ta', lastUpdated: '2026-02-01' },
  { brand: 'Chanel', minUYU: 7000, maxUYU: 13000, source: 'Duty Free / Tienda Inglesa', lastUpdated: '2026-02-01' },
  { brand: 'YSL', minUYU: 5500, maxUYU: 10000, source: 'Duty Free / Ta-Ta', lastUpdated: '2026-02-01' },
  { brand: 'Prada', minUYU: 6000, maxUYU: 11000, source: 'Duty Free / Tienda Inglesa', lastUpdated: '2026-02-01' },
  { brand: 'Versace', minUYU: 4000, maxUYU: 7500, source: 'Ta-Ta / Geant', lastUpdated: '2026-02-01' },
  { brand: 'Jean Paul Gaultier', minUYU: 5000, maxUYU: 9000, source: 'Duty Free / Ta-Ta', lastUpdated: '2026-02-01' },
  { brand: 'Dolce & Gabbana', minUYU: 4500, maxUYU: 8500, source: 'Ta-Ta / Duty Free', lastUpdated: '2026-02-01' },

  // Árabes - Más accesibles
  { brand: 'Lattafa', minUYU: 1800, maxUYU: 3500, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Maison Alhambra', minUYU: 1500, maxUYU: 3000, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Fragrance World', minUYU: 1500, maxUYU: 3000, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Armaf', minUYU: 2000, maxUYU: 4000, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Rasasi', minUYU: 2000, maxUYU: 4500, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Rayhaan', minUYU: 1500, maxUYU: 3000, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Bharara', minUYU: 3000, maxUYU: 6000, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },

  // Latinoamericanos / Españoles
  { brand: 'Zara', minUYU: 1500, maxUYU: 3000, source: 'Zara Uruguay', lastUpdated: '2026-02-01' },
  { brand: 'Natura', minUYU: 1200, maxUYU: 2800, source: 'Natura Uruguay', lastUpdated: '2026-02-01' },
  { brand: 'Halloween', minUYU: 1800, maxUYU: 3500, source: 'Ta-Ta / Farmacias', lastUpdated: '2026-02-01' },
  { brand: 'Antonio Banderas', minUYU: 1200, maxUYU: 2500, source: 'Ta-Ta / Farmacias', lastUpdated: '2026-02-01' },
  { brand: 'Adolfo Dominguez', minUYU: 2500, maxUYU: 5000, source: 'Tienda Inglesa / Duty Free', lastUpdated: '2026-02-01' },
  { brand: 'Jo Milano', minUYU: 3000, maxUYU: 5500, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
]

export function lookupUYPrice(brand: string, _concentration?: Concentration): PriceEstimate | null {
  const entry = uyPrices.find(
    p => p.brand.toLowerCase() === brand.toLowerCase()
  )

  if (!entry) return null

  return {
    amountUYU: Math.round((entry.minUYU + entry.maxUYU) / 2),
    source: entry.source,
    lastUpdated: entry.lastUpdated,
    confidence: 'estimate',
  }
}

export function getPriceRange(brand: string): { min: number; max: number } | null {
  const entry = uyPrices.find(
    p => p.brand.toLowerCase() === brand.toLowerCase()
  )
  if (!entry) return null
  return { min: entry.minUYU, max: entry.maxUYU }
}
