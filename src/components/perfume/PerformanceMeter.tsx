import { cn } from '@/lib/utils'

interface PerformanceMeterProps {
  label: string
  value: number
  max?: number
  icon: string
}

function getColor(value: number, max: number): string {
  const ratio = value / max
  if (ratio >= 0.8) return 'bg-accent-green text-accent-green'
  if (ratio >= 0.6) return 'bg-gold text-gold'
  if (ratio >= 0.4) return 'bg-season-summer text-season-summer'
  return 'bg-accent-rose text-accent-rose'
}

function getLabel(value: number, max: number): string {
  const ratio = value / max
  if (ratio >= 0.8) return 'Excelente'
  if (ratio >= 0.6) return 'Buena'
  if (ratio >= 0.4) return 'Moderada'
  return 'Baja'
}

export function PerformanceMeter({ label, value, max = 10, icon }: PerformanceMeterProps) {
  const color = getColor(value, max)
  const colorClass = color.split(' ')

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-secondary flex items-center gap-1">
          <span>{icon}</span>
          {label}
        </span>
        <span className={cn('text-xs font-medium', colorClass[1])}>
          {value}/{max} — {getLabel(value, max)}
        </span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClass[0])}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  )
}
