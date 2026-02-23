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
  { brand: 'Dolce Gabbana', minUYU: 4500, maxUYU: 8500, source: 'Ta-Ta / Duty Free', lastUpdated: '2026-02-01' },
  { brand: 'Yves Saint Laurent', minUYU: 5500, maxUYU: 10000, source: 'Duty Free / Ta-Ta', lastUpdated: '2026-02-01' },
  { brand: 'Lattafa Perfumes', minUYU: 1800, maxUYU: 3500, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },

  // Árabes - Más accesibles
  { brand: 'Lattafa', minUYU: 1800, maxUYU: 3500, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Maison Alhambra', minUYU: 1500, maxUYU: 3000, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Fragrance World', minUYU: 1500, maxUYU: 3000, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Armaf', minUYU: 2000, maxUYU: 4000, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Rasasi', minUYU: 2000, maxUYU: 4500, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Rayhaan', minUYU: 1500, maxUYU: 3000, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Bharara', minUYU: 3000, maxUYU: 6000, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },

  // Designer - Mainstream
  { brand: 'Giorgio Armani', minUYU: 3900, maxUYU: 11800, source: 'MercadoLibre UY / Farmashop', lastUpdated: '2026-02-22' },
  { brand: 'Carolina Herrera', minUYU: 3200, maxUYU: 8000, source: 'MercadoLibre UY / Farmashop', lastUpdated: '2026-02-22' },
  { brand: 'Givenchy', minUYU: 3400, maxUYU: 11200, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Hugo Boss', minUYU: 2500, maxUYU: 8400, source: 'MercadoLibre UY / Farmashop', lastUpdated: '2026-02-22' },
  { brand: 'Calvin Klein', minUYU: 1500, maxUYU: 7000, source: 'MercadoLibre UY / Farmacity', lastUpdated: '2026-02-22' },
  { brand: 'Burberry', minUYU: 2800, maxUYU: 10700, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Ralph Lauren', minUYU: 2700, maxUYU: 9750, source: 'MercadoLibre UY / FarmaUY', lastUpdated: '2026-02-22' },
  { brand: 'Valentino', minUYU: 4900, maxUYU: 14200, source: 'MercadoLibre UY / Farmashop', lastUpdated: '2026-02-22' },
  { brand: 'Guerlain', minUYU: 5000, maxUYU: 13900, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Azzaro', minUYU: 2500, maxUYU: 7900, source: 'MercadoLibre UY / Farmashop', lastUpdated: '2026-02-22' },
  { brand: 'Kenzo', minUYU: 3500, maxUYU: 9300, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Montblanc', minUYU: 4200, maxUYU: 7000, source: 'MercadoLibre UY / Farmashop', lastUpdated: '2026-02-22' },
  { brand: 'Mugler', minUYU: 5500, maxUYU: 14300, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Loewe', minUYU: 6900, maxUYU: 10000, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Rabanne', minUYU: 2800, maxUYU: 7200, source: 'MercadoLibre UY / Farmashop', lastUpdated: '2026-02-22' },
  { brand: 'Moschino', minUYU: 2980, maxUYU: 5900, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Tommy Hilfiger', minUYU: 2200, maxUYU: 5300, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Nautica', minUYU: 1300, maxUYU: 3990, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Nike', minUYU: 430, maxUYU: 1400, source: 'MercadoLibre UY / Farmacias', lastUpdated: '2026-02-22' },
  { brand: 'Viktor Rolf', minUYU: 4500, maxUYU: 12100, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Viktor & Rolf', minUYU: 4500, maxUYU: 12100, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },

  // Niche / Lujo
  { brand: 'Louis Vuitton', minUYU: 18000, maxUYU: 35000, source: 'Duty Free Carrasco', lastUpdated: '2026-02-22' },
  { brand: 'By Kilian', minUYU: 18000, maxUYU: 40000, source: 'Duty Free / Importación', lastUpdated: '2026-02-22' },

  // Árabes / Alternativas adicionales
  { brand: 'Afnan', minUYU: 2000, maxUYU: 5000, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Al Haramain', minUYU: 3100, maxUYU: 5900, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Al Haramain Perfumes', minUYU: 3100, maxUYU: 5900, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Dumont', minUYU: 1250, maxUYU: 5850, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Emper', minUYU: 1700, maxUYU: 6500, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'French Avenue', minUYU: 2700, maxUYU: 5700, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Le Chameau', minUYU: 3000, maxUYU: 5900, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Scalpers', minUYU: 2800, maxUYU: 3900, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Bentley', minUYU: 5200, maxUYU: 7000, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },
  { brand: 'Trussardi', minUYU: 3300, maxUYU: 7200, source: 'MercadoLibre UY', lastUpdated: '2026-02-22' },

  // Latinoamericanos / Españoles
  { brand: 'Zara', minUYU: 1500, maxUYU: 3000, source: 'Zara Uruguay', lastUpdated: '2026-02-01' },
  { brand: 'Natura', minUYU: 1200, maxUYU: 2800, source: 'Natura Uruguay', lastUpdated: '2026-02-01' },
  { brand: 'Halloween', minUYU: 1800, maxUYU: 3500, source: 'Ta-Ta / Farmacias', lastUpdated: '2026-02-01' },
  { brand: 'Antonio Banderas', minUYU: 1200, maxUYU: 2500, source: 'Ta-Ta / Farmacias', lastUpdated: '2026-02-01' },
  { brand: 'Adolfo Dominguez', minUYU: 2500, maxUYU: 5000, source: 'Tienda Inglesa / Duty Free', lastUpdated: '2026-02-01' },
  { brand: 'Jo Milano', minUYU: 3000, maxUYU: 5500, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
  { brand: 'Jo Milano Paris', minUYU: 3000, maxUYU: 5500, source: 'MercadoLibre UY / Importadores', lastUpdated: '2026-02-01' },
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
