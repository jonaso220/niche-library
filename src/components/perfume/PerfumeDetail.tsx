import { useNavigate } from 'react-router'
import type { Perfume } from '@/types/perfume'
import { RatingStars } from './RatingStars'
import { SeasonBadge } from './SeasonBadge'
import { PriceTag } from './PriceTag'
import { NotePyramid } from './NotePyramid'
import { AccordBar } from './AccordBar'
import { PerformanceMeter } from './PerformanceMeter'
import { addToCollection, removeFromCollection, useCollectionEntry, updateCollectionEntry } from '@/db/hooks'
import { OCCASION_LABELS } from '@/lib/utils'
import { ArrowLeft, Plus, Check, Trash2, ExternalLink } from 'lucide-react'

interface PerfumeDetailProps {
  perfume: Perfume
}

export function PerfumeDetail({ perfume }: PerfumeDetailProps) {
  const navigate = useNavigate()
  const entry = useCollectionEntry(perfume.id)

  async function handleAdd(owned: boolean) {
    await addToCollection(perfume.id, owned)
  }

  async function handleRemove() {
    await removeFromCollection(perfume.id)
  }

  async function handleRatingChange(rating: number) {
    if (entry) {
      await updateCollectionEntry(perfume.id, { personalRating: rating })
    }
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-gold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image */}
        <div className="w-full md:w-72 aspect-square bg-card rounded-xl border border-border flex items-center justify-center shrink-0">
          {perfume.imageUrl ? (
            <img
              src={perfume.imageUrl}
              alt={`${perfume.brand} ${perfume.name}`}
              className="w-full h-full object-contain p-6"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-text-muted">
              <span className="text-6xl">🧴</span>
              <span className="text-sm">{perfume.concentration}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gold-dim font-medium">
              {perfume.brand}
            </p>
            <h1 className="font-heading text-3xl font-bold text-text-primary mt-1">
              {perfume.name}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-text-secondary">
              <span>{perfume.concentration}</span>
              <span>•</span>
              <span className="capitalize">{perfume.gender}</span>
              {perfume.year && (
                <>
                  <span>•</span>
                  <span>{perfume.year}</span>
                </>
              )}
            </div>
          </div>

          <RatingStars
            rating={entry?.personalRating ?? perfume.rating}
            size="lg"
            interactive={!!entry}
            onChange={handleRatingChange}
          />

          <SeasonBadge seasonScores={perfume.seasonScores} />

          <PriceTag
            brand={perfume.brand}
            priceEstimate={entry?.priceEstimate}
          />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {!entry ? (
              <>
                <button
                  onClick={() => handleAdd(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gold text-background rounded-lg text-sm font-medium hover:bg-gold-bright transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar a Colección
                </button>
                <button
                  onClick={() => handleAdd(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-gold hover:border-gold/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Lista de Deseos
                </button>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2 px-4 py-2 bg-accent-green/15 text-accent-green rounded-lg text-sm">
                  <Check className="w-4 h-4" />
                  {entry.owned ? 'En tu colección' : 'En lista de deseos'}
                </span>
                <button
                  onClick={handleRemove}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Quitar
                </button>
              </>
            )}

            {perfume.sourceUrl && (
              <a
                href={perfume.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ver en Fragrantica
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Pirámide de Notas
          </h2>
          <NotePyramid notes={perfume.notes} />
        </div>

        {/* Accords */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Acordes Principales
          </h2>
          <AccordBar accords={perfume.accords} />
        </div>

        {/* Performance */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Rendimiento
          </h2>
          <div className="space-y-4">
            <PerformanceMeter label="Longevidad" value={perfume.longevity} icon="⏱" />
            <PerformanceMeter label="Sillage" value={perfume.sillage} icon="💨" />
          </div>
        </div>

        {/* Occasions */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Ocasiones
          </h2>
          <div className="space-y-3">
            {perfume.occasionScores.map(({ occasion, score }) => (
              <div key={occasion} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-text-secondary">{OCCASION_LABELS[occasion] ?? occasion}</span>
                  <span className="text-text-muted">{score}%</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold/70 rounded-full transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personal notes */}
      {entry?.personalNotes && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-2">
            Notas Personales
          </h2>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{entry.personalNotes}</p>
        </div>
      )}
    </div>
  )
}
