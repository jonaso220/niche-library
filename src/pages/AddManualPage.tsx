import { useState } from 'react'
import { useNavigate } from 'react-router'
import { addPerfumeToCatalog, addToCollection } from '@/db/hooks'
import { generateSlug } from '@/lib/utils'
import type { Perfume, Gender, Concentration, Season, OccasionType } from '@/types/perfume'
import { Save, ArrowLeft } from 'lucide-react'

export function AddManualPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [year, setYear] = useState('')
  const [gender, setGender] = useState<Gender>('unisex')
  const [concentration, setConcentration] = useState<Concentration>('EDP')
  const [rating, setRating] = useState('4.0')
  const [longevity, setLongevity] = useState('6')
  const [sillage, setSillage] = useState('6')
  const [imageUrl, setImageUrl] = useState('')
  const [topNotes, setTopNotes] = useState('')
  const [middleNotes, setMiddleNotes] = useState('')
  const [baseNotes, setBaseNotes] = useState('')
  const [accords, setAccords] = useState('')

  // Season scores
  const [spring, setSpring] = useState('50')
  const [summer, setSummer] = useState('50')
  const [fall, setFall] = useState('50')
  const [winter, setWinter] = useState('50')

  // Occasion scores
  const [casual, setCasual] = useState('50')
  const [professional, setProfessional] = useState('50')
  const [nightOut, setNightOut] = useState('50')
  const [dateScore, setDateScore] = useState('50')
  const [special, setSpecial] = useState('50')

  function parseNotes(text: string) {
    return text
      .split(',')
      .map(n => n.trim())
      .filter(Boolean)
      .map(n => ({ name: n }))
  }

  function parseAccords(text: string) {
    return text
      .split(',')
      .map(a => a.trim())
      .filter(Boolean)
      .map(a => ({ name: a, percentage: 50 }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !brand.trim()) return

    setSaving(true)

    const perfume: Perfume = {
      id: generateSlug(brand, name, concentration),
      name: name.trim(),
      brand: brand.trim(),
      year: year ? parseInt(year) : undefined,
      gender,
      concentration,
      rating: parseFloat(rating) || 4.0,
      longevity: parseInt(longevity) || 6,
      sillage: parseInt(sillage) || 6,
      notes: {
        top: parseNotes(topNotes),
        middle: parseNotes(middleNotes),
        base: parseNotes(baseNotes),
      },
      accords: parseAccords(accords),
      seasonScores: [
        { season: 'spring' as Season, score: parseInt(spring) },
        { season: 'summer' as Season, score: parseInt(summer) },
        { season: 'fall' as Season, score: parseInt(fall) },
        { season: 'winter' as Season, score: parseInt(winter) },
      ],
      occasionScores: [
        { occasion: 'casual' as OccasionType, score: parseInt(casual) },
        { occasion: 'professional' as OccasionType, score: parseInt(professional) },
        { occasion: 'nightOut' as OccasionType, score: parseInt(nightOut) },
        { occasion: 'date' as OccasionType, score: parseInt(dateScore) },
        { occasion: 'special' as OccasionType, score: parseInt(special) },
      ],
      imageUrl: imageUrl || undefined,
      dataSource: 'manual',
    }

    await addPerfumeToCatalog(perfume)
    await addToCollection(perfume.id, true)
    navigate(`/perfume/${perfume.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-gold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver
      </button>

      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
          Agregar Perfume Manualmente
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Completa los datos del perfume que quieres agregar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <fieldset className="bg-card border border-border rounded-xl p-5 space-y-4">
          <legend className="font-heading text-sm font-semibold text-gold px-2">Información Básica</legend>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre *" value={name} onChange={setName} placeholder="Ej: Sauvage" required />
            <Field label="Marca *" value={brand} onChange={setBrand} placeholder="Ej: Dior" required />
            <Field label="Año" value={year} onChange={setYear} placeholder="Ej: 2018" type="number" />
            <Field label="URL de Imagen" value={imageUrl} onChange={setImageUrl} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <SelectField label="Género" value={gender} onChange={(v) => setGender(v as Gender)}
              options={[
                { value: 'masculino', label: 'Masculino' },
                { value: 'femenino', label: 'Femenino' },
                { value: 'unisex', label: 'Unisex' },
              ]}
            />
            <SelectField label="Concentración" value={concentration} onChange={(v) => setConcentration(v as Concentration)}
              options={[
                { value: 'EDT', label: 'EDT' },
                { value: 'EDP', label: 'EDP' },
                { value: 'Extrait', label: 'Extrait' },
                { value: 'Parfum', label: 'Parfum' },
                { value: 'EDC', label: 'EDC' },
              ]}
            />
            <Field label="Rating (0-5)" value={rating} onChange={setRating} type="number" min="0" max="5" step="0.1" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SliderField label="Longevidad" value={longevity} onChange={setLongevity} max={10} />
            <SliderField label="Sillage" value={sillage} onChange={setSillage} max={10} />
          </div>
        </fieldset>

        {/* Notes */}
        <fieldset className="bg-card border border-border rounded-xl p-5 space-y-4">
          <legend className="font-heading text-sm font-semibold text-gold px-2">Notas (separar con comas)</legend>
          <Field label="Notas de Salida" value={topNotes} onChange={setTopNotes} placeholder="bergamota, pimienta, lavanda" />
          <Field label="Notas de Corazón" value={middleNotes} onChange={setMiddleNotes} placeholder="iris, cedro, ambroxan" />
          <Field label="Notas de Fondo" value={baseNotes} onChange={setBaseNotes} placeholder="vainilla, ámbar, almizcle" />
          <Field label="Acordes Principales" value={accords} onChange={setAccords} placeholder="woody, fresh, aromatic, amber" />
        </fieldset>

        {/* Seasons */}
        <fieldset className="bg-card border border-border rounded-xl p-5 space-y-4">
          <legend className="font-heading text-sm font-semibold text-gold px-2">Temporadas (0-100)</legend>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SliderField label="🌸 Primavera" value={spring} onChange={setSpring} max={100} />
            <SliderField label="☀️ Verano" value={summer} onChange={setSummer} max={100} />
            <SliderField label="🍂 Otoño" value={fall} onChange={setFall} max={100} />
            <SliderField label="❄️ Invierno" value={winter} onChange={setWinter} max={100} />
          </div>
        </fieldset>

        {/* Occasions */}
        <fieldset className="bg-card border border-border rounded-xl p-5 space-y-4">
          <legend className="font-heading text-sm font-semibold text-gold px-2">Ocasiones (0-100)</legend>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <SliderField label="Casual" value={casual} onChange={setCasual} max={100} />
            <SliderField label="Profesional" value={professional} onChange={setProfessional} max={100} />
            <SliderField label="Salida Nocturna" value={nightOut} onChange={setNightOut} max={100} />
            <SliderField label="Cita" value={dateScore} onChange={setDateScore} max={100} />
            <SliderField label="Especial" value={special} onChange={setSpecial} max={100} />
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={saving || !name.trim() || !brand.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-background rounded-xl font-medium hover:bg-gold-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar Perfume'}
        </button>
      </form>
    </div>
  )
}

// Helper components
function Field({ label, value, onChange, placeholder, type = 'text', required, min, max, step }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
  type?: string; required?: boolean; min?: string; max?: string; step?: string
}) {
  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block text-xs text-text-secondary mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-gold/50"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function SliderField({ label, value, onChange, max }: {
  label: string; value: string; onChange: (v: string) => void; max: number
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs text-text-secondary">{label}</label>
        <span className="text-xs text-text-muted font-mono">{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-1.5 bg-surface rounded-full appearance-none cursor-pointer accent-gold"
      />
    </div>
  )
}
