import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { Perfume } from '@/types/perfume'
import { RatingStars } from './RatingStars'
import { SeasonBadge } from './SeasonBadge'
import { PriceTag } from './PriceTag'
import { NotePyramid } from './NotePyramid'
import { AccordBar } from './AccordBar'
import { PerformanceMeter } from './PerformanceMeter'
import { addToCollection, removeFromCollection, useCollectionEntry, updateCollectionEntry, updatePerfumeImage, addPerfumeToCatalog } from '@/db/hooks'
import { OCCASION_LABELS } from '@/lib/utils'
import { ArrowLeft, Plus, Check, Trash2, ExternalLink, Pencil, X, Save, Archive, RotateCcw } from 'lucide-react'

interface PerfumeDetailProps {
  perfume: Perfume
}

export function PerfumeDetail({ perfume }: PerfumeDetailProps) {
  const navigate = useNavigate()
  const entry = useCollectionEntry(perfume.id)
  const [editingImage, setEditingImage] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [imagePreviewError, setImagePreviewError] = useState(false)

  async function handleAdd(owned: boolean) {
    await addPerfumeToCatalog(perfume)
    await addToCollection(perfume.id, owned)
  }

  async function handleRemove() {
    await removeFromCollection(perfume.id)
  }

  async function handleMarkPreviouslyOwned() {
    await updateCollectionEntry(perfume.id, { owned: false, previouslyOwned: true })
  }

  async function handleRecover() {
    await updateCollectionEntry(perfume.id, { owned: true, previouslyOwned: false })
  }

  async function handleMarkOwned() {
    await updateCollectionEntry(perfume.id, { owned: true, previouslyOwned: false })
  }

  async function handleRatingChange(rating: number) {
    if (entry) {
      await updateCollectionEntry(perfume.id, { personalRating: rating })
    }
  }

  function openImageEditor() {
    setImageUrlInput(perfume.imageUrl ?? '')
    setImagePreviewError(false)
    setEditingImage(true)
  }

  async function handleSaveImage() {
    if (!imageUrlInput.trim()) return
    await updatePerfumeImage(perfume, imageUrlInput.trim())
    setEditingImage(false)
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-gold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Volver
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image */}
        <div className="w-full md:w-72 shrink-0 space-y-3">
          <div className="group relative aspect-square rounded-xl border border-border flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_rgba(180,170,155,0.12)_0%,_transparent_70%)]">
            {perfume.imageUrl ? (
              <img
                src={perfume.imageUrl}
                alt={`${perfume.brand} ${perfume.name}`}
                className="w-full h-full object-contain p-6 brightness-[0.88] contrast-[1.05] group-hover:brightness-100 transition-all duration-300"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-text-muted">
                <span className="text-6xl">🧴</span>
                <span className="text-sm">{perfume.concentration}</span>
              </div>
            )}

            {/* Edit image overlay button */}
            <button
              type="button"
              onClick={openImageEditor}
              className="absolute bottom-2 right-2 p-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg text-text-muted hover:text-gold hover:border-gold/30 opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="Cambiar imagen"
            >
              <Pencil className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Image URL editor */}
          {editingImage && (
            <div className="bg-card rounded-xl border border-gold/20 p-4 space-y-3">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Cambiar imagen</p>
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => {
                  setImageUrlInput(e.target.value)
                  setImagePreviewError(false)
                }}
                placeholder="https://... URL de la imagen"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-gold/40"
                autoFocus
              />

              {/* Preview */}
              {imageUrlInput.trim() && !imagePreviewError && (
                <div className="aspect-square w-full bg-surface rounded-lg border border-border/50 flex items-center justify-center overflow-hidden">
                  <img
                    src={imageUrlInput.trim()}
                    alt="Preview"
                    className="w-full h-full object-contain p-3"
                    onError={() => setImagePreviewError(true)}
                  />
                </div>
              )}
              {imagePreviewError && (
                <p className="text-xs text-danger">No se pudo cargar la imagen. Verifica la URL.</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveImage}
                  disabled={!imageUrlInput.trim() || imagePreviewError}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gold text-background rounded-lg text-sm font-medium hover:bg-gold-bright transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Save className="w-3.5 h-3.5" aria-hidden="true" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingImage(false)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  Cancelar
                </button>
              </div>
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
                  type="button"
                  onClick={() => handleAdd(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gold text-background rounded-lg text-sm font-medium hover:bg-gold-bright transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Agregar a Colección
                </button>
                <button
                  type="button"
                  onClick={() => handleAdd(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-gold hover:border-gold/30 transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Lista de Deseos
                </button>
              </>
            ) : entry.previouslyOwned ? (
              <>
                <span className="flex items-center gap-2 px-4 py-2 bg-text-muted/10 text-text-muted rounded-lg text-sm">
                  <Archive className="w-4 h-4" aria-hidden="true" />
                  Fragancia anterior
                </span>
                <button
                  type="button"
                  onClick={handleRecover}
                  className="flex items-center gap-2 px-4 py-2 bg-gold text-background rounded-lg text-sm font-medium hover:bg-gold-bright transition-colors"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  Recuperar
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  Quitar
                </button>
              </>
            ) : (
              <>
                <span className="flex items-center gap-2 px-4 py-2 bg-accent-green/15 text-accent-green rounded-lg text-sm">
                  <Check className="w-4 h-4" aria-hidden="true" />
                  {entry.owned ? 'En tu colección' : 'En lista de deseos'}
                </span>
                {entry.owned && (
                  <button
                    type="button"
                    onClick={handleMarkPreviouslyOwned}
                    className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary hover:border-border transition-colors"
                  >
                    <Archive className="w-4 h-4" aria-hidden="true" />
                    Ya no la tengo
                  </button>
                )}
                {!entry.owned && (
                  <button
                    type="button"
                    onClick={handleMarkOwned}
                    className="flex items-center gap-2 px-4 py-2 bg-gold text-background rounded-lg text-sm font-medium hover:bg-gold-bright transition-colors"
                  >
                    <Check className="w-4 h-4" aria-hidden="true" />
                    Ya lo tengo
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
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
                <ExternalLink className="w-4 h-4" aria-hidden="true" />
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
