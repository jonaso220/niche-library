import type { NotePyramid as NotePyramidType } from '@/types/perfume'

interface NotePyramidProps {
  notes: NotePyramidType
}

function NoteRow({ label, notes, color }: {
  label: string
  notes: { name: string; imageUrl?: string }[]
  color: string
}) {
  if (notes.length === 0) return null

  return (
    <div className="space-y-1.5">
      <h4 className={`text-xs font-semibold uppercase tracking-wider ${color}`}>
        {label}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {notes.map(note => (
          <span
            key={note.name}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface border border-border-subtle text-xs text-text-secondary"
          >
            {note.imageUrl && (
              <img src={note.imageUrl} alt="" className="w-3.5 h-3.5 rounded-full" />
            )}
            {note.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export function NotePyramid({ notes }: NotePyramidProps) {
  if (!notes.top.length && !notes.middle.length && !notes.base.length) {
    return (
      <p className="text-sm text-text-muted italic">No hay información de notas disponible.</p>
    )
  }

  return (
    <div className="space-y-4">
      <NoteRow label="Notas de Salida" notes={notes.top} color="text-season-summer" />
      <NoteRow label="Notas de Corazón" notes={notes.middle} color="text-accent-rose" />
      <NoteRow label="Notas de Fondo" notes={notes.base} color="text-gold-dim" />
    </div>
  )
}
