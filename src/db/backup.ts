import type { CollectionEntry, Perfume } from '@/types/perfume'

export interface BackupData {
  perfumes: Perfume[]
  collection: CollectionEntry[]
  exportedAt?: string
}

const genders = new Set(['masculino', 'femenino', 'unisex'])
const concentrations = new Set(['EDT', 'EDP', 'Extrait', 'Parfum', 'EDC', 'Other'])
const sources = new Set(['fragella', 'fragrancefinder', 'manual', 'seed', 'fragrantica', 'parfumo'])

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isValidPerfume(value: unknown): value is Perfume {
  if (!isObject(value)) return false
  return typeof value.id === 'string' && value.id.length > 0
    && typeof value.name === 'string' && value.name.length > 0
    && typeof value.brand === 'string' && value.brand.length > 0
    && genders.has(String(value.gender))
    && concentrations.has(String(value.concentration))
    && sources.has(String(value.dataSource))
    && isFiniteNumber(value.rating)
    && isFiniteNumber(value.longevity)
    && isFiniteNumber(value.sillage)
    && isObject(value.notes)
    && Array.isArray(value.notes.top)
    && Array.isArray(value.notes.middle)
    && Array.isArray(value.notes.base)
    && Array.isArray(value.accords)
    && Array.isArray(value.seasonScores)
    && Array.isArray(value.occasionScores)
}

function isValidCollectionEntry(value: unknown): value is CollectionEntry {
  if (!isObject(value)) return false
  return typeof value.perfumeId === 'string' && value.perfumeId.length > 0
    && typeof value.addedAt === 'string'
    && typeof value.owned === 'boolean'
}

export function parseBackup(raw: unknown): BackupData {
  if (!isObject(raw)) throw new Error('El archivo no contiene un objeto JSON válido.')
  if (!Array.isArray(raw.perfumes) || !Array.isArray(raw.collection)) {
    throw new Error('El archivo debe incluir las listas perfumes y collection.')
  }

  if (!raw.perfumes.every(isValidPerfume)) {
    throw new Error('Hay perfumes con un formato inválido o campos obligatorios faltantes.')
  }
  if (!raw.collection.every(isValidCollectionEntry)) {
    throw new Error('Hay entradas de colección con un formato inválido.')
  }

  const now = new Date().toISOString()
  return {
    perfumes: raw.perfumes.map(perfume => ({ ...perfume, updatedAt: perfume.updatedAt ?? now })),
    collection: raw.collection.map(entry => ({ ...entry, updatedAt: entry.updatedAt ?? entry.addedAt ?? now })),
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : undefined,
  }
}
