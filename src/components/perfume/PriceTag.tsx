import { formatUYU } from '@/lib/utils'
import type { PriceEstimate } from '@/types/perfume'
import { lookupUYPrice } from '@/data/uy-prices'

interface PriceTagProps {
  brand: string
  priceEstimate?: PriceEstimate | null
  compact?: boolean
}

export function PriceTag({ brand, priceEstimate, compact = false }: PriceTagProps) {
  const price = priceEstimate ?? lookupUYPrice(brand)

  if (!price) return null

  return (
    <div className="inline-flex items-center gap-1">
      <span className={compact ? 'text-xs text-text-secondary' : 'text-sm font-medium text-gold-dim'}>
        ~{formatUYU(price.amountUYU)}
      </span>
      {!compact && (
        <span className="text-[10px] text-text-muted">
          ({price.source})
        </span>
      )}
    </div>
  )
}
