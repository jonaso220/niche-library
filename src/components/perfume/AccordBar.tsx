import type { AccordStrength } from '@/types/perfume'

interface AccordBarProps {
  accords: AccordStrength[]
  max?: number
}

const ACCORD_COLORS: Record<string, string> = {
  woody: 'bg-amber-700',
  amaderado: 'bg-amber-700',
  fresh: 'bg-teal-500',
  fresco: 'bg-teal-500',
  citrus: 'bg-yellow-500',
  floral: 'bg-pink-400',
  sweet: 'bg-rose-400',
  amber: 'bg-orange-500',
  leather: 'bg-stone-600',
  aromatic: 'bg-green-600',
  oriental: 'bg-red-700',
  aquatic: 'bg-cyan-500',
  musky: 'bg-purple-400',
  powdery: 'bg-pink-300',
  'warm spicy': 'bg-red-500',
  'fresh spicy': 'bg-emerald-500',
  vanilla: 'bg-amber-400',
  tobacco: 'bg-amber-800',
  oud: 'bg-stone-700',
  smoky: 'bg-gray-600',
  fruity: 'bg-orange-400',
  green: 'bg-green-500',
  balsamic: 'bg-amber-600',
}

function getAccordColor(name: string): string {
  const lower = name.toLowerCase()
  return ACCORD_COLORS[lower] ?? 'bg-gold-dim'
}

export function AccordBar({ accords, max = 8 }: AccordBarProps) {
  const sorted = [...accords].sort((a, b) => b.percentage - a.percentage).slice(0, max)

  if (sorted.length === 0) {
    return <p className="text-sm text-text-muted italic">No hay acordes disponibles.</p>
  }

  return (
    <div className="space-y-2">
      {sorted.map(accord => (
        <div key={accord.name} className="space-y-0.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-secondary capitalize">{accord.name}</span>
            <span className="text-[10px] text-text-muted">{accord.percentage}%</span>
          </div>
          <div className="h-2 bg-surface rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getAccordColor(accord.name)}`}
              style={{ width: `${accord.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
