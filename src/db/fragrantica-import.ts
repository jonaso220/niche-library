import { db } from './database'
import { searchParfumo, isParfumoLoaded, loadParfumoDataset } from './parfumo-loader'
import { generateSlug } from '@/lib/utils'
import { mapConcentration, buildDefaultSeasonScores, buildDefaultOccasionScores, inferSeasonScores, inferOccasionScores } from '@/api/mappers'
import { addPerfumeToCatalog, addToCollection } from './hooks'
import { fragranticaCollection, fragranticaWishlist, type FragranticaEntry } from '@/data/fragrantica-collection'
import type { Perfume } from '@/types/perfume'

const FRAGRANTICA_IMG = (id: string) => `https://fimgs.net/mdimg/perfume/375x500.${id}.jpg`
const IMPORT_DONE_KEY = 'niche-library-fragrantica-import-v'
const CURRENT_IMPORT_VERSION = 4

export function isFragranticaImportDone(): boolean {
  return localStorage.getItem(IMPORT_DONE_KEY) === String(CURRENT_IMPORT_VERSION)
}

/**
 * Try to find a matching entry in the Parfumo dataset for richer data.
 * Returns null if no good match is found.
 */
async function findParfumoMatch(entry: FragranticaEntry) {
  // Try searching by brand + name
  const results = await searchParfumo(`${entry.brand} ${entry.name}`, 5)

  // Try to find an exact or very close match
  const brandL = entry.brand.toLowerCase()
  const nameL = entry.name.toLowerCase()

  for (const r of results) {
    const rBrandL = r.brand.toLowerCase()
    const rNameL = r.name.toLowerCase()

    // Exact brand+name match
    if (rBrandL === brandL && rNameL === nameL) return r

    // Brand matches and name is contained or contains
    if (rBrandL.includes(brandL) || brandL.includes(rBrandL)) {
      if (rNameL.includes(nameL) || nameL.includes(rNameL)) return r
    }
  }

  return null
}

function parseNotesList(raw: string): { name: string }[] {
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name }))
}

function parseAccords(raw: string): Perfume['accords'] {
  if (!raw) return []
  return raw.split(',').map((s, i, arr) => ({
    name: s.trim(),
    percentage: Math.round(80 - (i / arr.length) * 60),
  })).filter(a => a.name)
}

function mapGenderFromName(name: string, brand: string): Perfume['gender'] {
  const lower = `${name} ${brand}`.toLowerCase()
  if (lower.includes('pour homme') || lower.includes('for men') || lower.includes(' man ') || lower.includes(' him')) return 'masculino'
  if (lower.includes('pour femme') || lower.includes('for women') || lower.includes(' woman ') || lower.includes(' her')) return 'femenino'
  return 'masculino' // Default for this collection (all masculine)
}

/**
 * Import all 101 collection + 71 wishlist fragrances from Fragrantica.
 * For each entry:
 *   1. Search Parfumo dataset for rich data (notes, accords, rating)
 *   2. Fall back to minimal entry with Fragrantica image
 *   3. Add to perfumes table + collection table
 *
 * Returns progress callback for UI updates.
 */
/**
 * Fast pass: update season/occasion scores for all perfumes that already exist
 * in the DB. Reads directly from IndexedDB — no Parfumo download needed.
 */
async function upgradeExistingScores(
  onProgress?: (done: number, total: number, current: string) => void
): Promise<void> {
  const all = await db.perfumes.toArray()
  const allPerfumes = all.filter(p => p.dataSource === 'fragrantica')
  const total = allPerfumes.length

  for (let i = 0; i < allPerfumes.length; i++) {
    const p = allPerfumes[i]
    onProgress?.(i, total, `Actualizando ${p.brand} - ${p.name}`)

    const hasDefaultScores = p.seasonScores.every(s => s.score === 5)
    if (hasDefaultScores && p.accords.length > 0) {
      await db.perfumes.update(p.id, {
        seasonScores: inferSeasonScores(p.accords),
        occasionScores: inferOccasionScores(p.accords),
      })
    }
  }
}

export async function importFragranticaCollection(
  onProgress?: (done: number, total: number, current: string) => void
): Promise<{ imported: number; skipped: number; errors: number }> {
  let imported = 0
  let skipped = 0
  let errors = 0

  try {
    // Check if this is just a score upgrade (perfumes already imported)
    const allPerfumes = await db.perfumes.toArray()
    const existingCount = allPerfumes.filter(p => p.dataSource === 'fragrantica').length
    if (existingCount > 0) {
      // Fast path: just update scores from existing accords, no Parfumo needed
      onProgress?.(0, existingCount, 'Actualizando scores de temporada...')
      await upgradeExistingScores(onProgress)
      onProgress?.(existingCount, existingCount, 'Actualización completa')
      return { imported: 0, skipped: existingCount, errors: 0 }
    }

    // Full import path (first time only)
    let parfumoAvailable = isParfumoLoaded()
    if (!parfumoAvailable) {
      try {
        onProgress?.(0, 172, 'Cargando dataset Parfumo...')
        await loadParfumoDataset()
        parfumoAvailable = true
      } catch (err) {
        console.warn('Parfumo dataset failed to load, importing with minimal data:', err)
        parfumoAvailable = false
      }
    }

    const allEntries: Array<{ entry: FragranticaEntry; owned: boolean }> = [
      ...fragranticaCollection.map(e => ({ entry: e, owned: true })),
      ...fragranticaWishlist.map(e => ({ entry: e, owned: false })),
    ]

    const total = allEntries.length

    for (let i = 0; i < allEntries.length; i++) {
      const { entry, owned } = allEntries[i]

      try {
        onProgress?.(i, total, `${entry.brand} - ${entry.name}`)

        const parfumoMatch = parfumoAvailable ? await findParfumoMatch(entry) : null

        const finalId = parfumoMatch
          ? generateSlug(entry.brand, entry.name, parfumoMatch.concentration)
          : generateSlug(entry.brand, entry.name, '')
        const existing = await db.collection.get(finalId)
        if (existing) {
          skipped++
          continue
        }

        let perfume: Perfume

        if (parfumoMatch) {
          const accords = parseAccords(parfumoMatch.accords)
          perfume = {
            id: generateSlug(entry.brand, entry.name, parfumoMatch.concentration),
            name: entry.name,
            brand: entry.brand,
            year: parfumoMatch.year || undefined,
            gender: mapGenderFromName(entry.name, entry.brand),
            concentration: mapConcentration(parfumoMatch.concentration),
            rating: parfumoMatch.rating ? parfumoMatch.rating / 2 : 3,
            longevity: 5,
            sillage: 5,
            notes: {
              top: parseNotesList(parfumoMatch.topNotes),
              middle: parseNotesList(parfumoMatch.midNotes),
              base: parseNotesList(parfumoMatch.baseNotes),
            },
            accords,
            seasonScores: inferSeasonScores(accords),
            occasionScores: inferOccasionScores(accords),
            imageUrl: FRAGRANTICA_IMG(entry.fragranticaId),
            dataSource: 'fragrantica',
          }
        } else {
          perfume = {
            id: generateSlug(entry.brand, entry.name, ''),
            name: entry.name,
            brand: entry.brand,
            gender: mapGenderFromName(entry.name, entry.brand),
            concentration: 'EDP',
            rating: 3,
            longevity: 5,
            sillage: 5,
            notes: { top: [], middle: [], base: [] },
            accords: [],
            seasonScores: buildDefaultSeasonScores(),
            occasionScores: buildDefaultOccasionScores(),
            imageUrl: FRAGRANTICA_IMG(entry.fragranticaId),
            dataSource: 'fragrantica',
          }
        }

        await addPerfumeToCatalog(perfume)
        await addToCollection(perfume.id, owned)
        imported++
      } catch (err) {
        console.error(`Failed to import ${entry.brand} ${entry.name}:`, err)
        errors++
      }
    }

    onProgress?.(total, total, 'Importación completa')
  } catch (err) {
    console.error('Fragrantica import failed:', err)
  } finally {
    // ALWAYS mark import as done to prevent re-running on every reload
    localStorage.setItem(IMPORT_DONE_KEY, String(CURRENT_IMPORT_VERSION))
  }

  return { imported, skipped, errors }
}
