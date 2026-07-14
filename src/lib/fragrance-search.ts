export interface FragranceSearchDocument {
  name: string
  brand: string
  concentration?: string
  year?: number
}

export interface PreparedFragranceSearchDocument {
  name: string
  brand: string
  concentration: string
  phrases: string[]
  tokens: string[]
  tokenSet: Set<string>
}

export interface PreparedFragranceSearchQuery {
  normalized: string
  tokens: string[]
}

const COMBINING_MARKS_RE = /[\u0300-\u036f]/g
const NON_ALPHANUMERIC_RE = /[^a-z0-9]+/g

const CONCENTRATION_ALIASES: ReadonlyArray<[RegExp, string]> = [
  [/\beau de parfum intense\b/g, 'edp intense'],
  [/\beau de parfum\b/g, 'edp'],
  [/\beau de toilette\b/g, 'edt'],
  [/\beau de cologne\b/g, 'edc'],
  [/\bextrait de parfum\b/g, 'extrait'],
  [/\bparfum extract\b/g, 'extrait'],
  [/\bextracto de perfume\b/g, 'extrait'],
  [/\bagua de perfume\b/g, 'edp'],
  [/\bagua de tocador\b/g, 'edt'],
  [/\bagua de colonia\b/g, 'edc'],
]

/**
 * Produces the same search representation for user input and catalog data.
 * Accents, punctuation and common concentration names are normalized so they
 * do not prevent an otherwise valid match.
 */
export function normalizeFragranceText(value: string): string {
  let normalized = value
    .normalize('NFD')
    .replace(COMBINING_MARKS_RE, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(NON_ALPHANUMERIC_RE, ' ')
    .trim()
    .replace(/\s+/g, ' ')

  for (const [pattern, replacement] of CONCENTRATION_ALIASES) {
    normalized = normalized.replace(pattern, replacement)
  }

  return normalized.replace(/\s+/g, ' ').trim()
}

export function prepareFragranceSearchQuery(query: string): PreparedFragranceSearchQuery {
  const normalized = normalizeFragranceText(query)
  return {
    normalized,
    tokens: normalized ? Array.from(new Set(normalized.split(' '))) : [],
  }
}

export function prepareFragranceSearchDocument(
  document: FragranceSearchDocument,
): PreparedFragranceSearchDocument {
  const name = normalizeFragranceText(document.name)
  const brand = normalizeFragranceText(document.brand)
  const concentration = normalizeFragranceText(document.concentration ?? '')
  const year = document.year ? String(document.year) : ''
  const phrases = [
    name,
    `${brand} ${name}`,
    `${name} ${brand}`,
    `${brand} ${name} ${concentration}`,
    `${name} ${brand} ${concentration}`,
  ].map(value => value.trim()).filter(Boolean)
  const tokens = Array.from(new Set(
    `${name} ${brand} ${concentration} ${year}`.trim().split(/\s+/).filter(Boolean),
  ))

  return {
    name,
    brand,
    concentration,
    phrases,
    tokens,
    tokenSet: new Set(tokens),
  }
}

/** Optimal-string-alignment distance, including adjacent transpositions. */
function editDistance(left: string, right: string): number {
  const rows = left.length + 1
  const columns = right.length + 1
  const matrix = Array.from({ length: rows }, () => new Array<number>(columns).fill(0))

  for (let row = 0; row < rows; row++) matrix[row][0] = row
  for (let column = 0; column < columns; column++) matrix[0][column] = column

  for (let row = 1; row < rows; row++) {
    for (let column = 1; column < columns; column++) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1
      let distance = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost,
      )

      if (
        row > 1 &&
        column > 1 &&
        left[row - 1] === right[column - 2] &&
        left[row - 2] === right[column - 1]
      ) {
        distance = Math.min(distance, matrix[row - 2][column - 2] + 1)
      }

      matrix[row][column] = distance
    }
  }

  return matrix[left.length][right.length]
}

function tokenSimilarity(queryToken: string, candidateToken: string): number {
  if (queryToken === candidateToken) return 1

  const shortestLength = Math.min(queryToken.length, candidateToken.length)
  const longestLength = Math.max(queryToken.length, candidateToken.length)

  // Prefixes keep short, incremental searches useful without accepting typos
  // that would make two-character queries excessively broad.
  if (candidateToken.startsWith(queryToken) || queryToken.startsWith(candidateToken)) {
    if (shortestLength >= 2) return Math.max(0.82, 0.94 - (longestLength - shortestLength) * 0.02)
  }

  if (shortestLength >= 4 && (candidateToken.includes(queryToken) || queryToken.includes(candidateToken))) {
    return 0.82
  }

  if (shortestLength < 4 || Math.abs(queryToken.length - candidateToken.length) > 2) return 0

  const maximumDistance = longestLength <= 5 ? 1 : longestLength <= 9 ? 2 : 3
  const distance = editDistance(queryToken, candidateToken)
  if (distance > maximumDistance) return 0

  const similarity = 1 - distance / longestLength
  return similarity >= 0.68 ? similarity : 0
}

function bestTokenSimilarity(
  queryToken: string,
  document: PreparedFragranceSearchDocument,
): number {
  if (document.tokenSet.has(queryToken)) return 1

  let best = 0
  for (const candidateToken of document.tokens) {
    best = Math.max(best, tokenSimilarity(queryToken, candidateToken))
    if (best >= 0.94) break
  }
  return best
}

/**
 * Returns a relevance value between 0 and 1. A zero means at least one query
 * term could not be matched; token order does not affect the score.
 */
export function scorePreparedFragranceMatch(
  query: PreparedFragranceSearchQuery,
  document: PreparedFragranceSearchDocument,
): number {
  if (!query.normalized || query.tokens.length === 0) return 0

  if (document.phrases.some(phrase => phrase === query.normalized)) return 1
  if (document.name.startsWith(query.normalized)) return 0.98
  if (document.name.includes(query.normalized)) return 0.96
  if (document.phrases.some(phrase => phrase.includes(query.normalized))) return 0.94

  let totalSimilarity = 0
  for (const token of query.tokens) {
    const similarity = bestTokenSimilarity(token, document)
    if (similarity < 0.68) return 0
    totalSimilarity += similarity
  }

  const averageSimilarity = totalSimilarity / query.tokens.length
  const allTokensExact = query.tokens.every(token => document.tokenSet.has(token))
  return Math.min(1, averageSimilarity + (allTokensExact ? 0.04 : 0))
}

export function scoreFragranceMatch(query: string, document: FragranceSearchDocument): number {
  return scorePreparedFragranceMatch(
    prepareFragranceSearchQuery(query),
    prepareFragranceSearchDocument(document),
  )
}
