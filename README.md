# Niche Library

App web para gestionar tu colección personal de fragancias: catalogar, puntuar y organizar perfumes por **temporada**, **ocasión** y **estanterías personalizadas**, con búsqueda sobre un catálogo global de 59 000+ fragancias y sincronización opcional en la nube.

Está escrita en **React 19 + TypeScript + Vite**, usa **Tailwind CSS v4** para estilos, **Dexie (IndexedDB)** como base de datos local y **Firebase (Auth + Firestore)** para el sync opcional entre dispositivos.

---

## Empezar

### Requisitos
- Node.js **≥ 22.13** (coincide con `netlify.toml`)
- npm **10+**

### Instalación y arranque

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`. En el primer arranque descarga el dataset de Parfumo (~2 MB, cacheado en IndexedDB para siempre).

### Variables de entorno

Copia `.env.example` a `.env.local` y rellena los valores. Todas son opcionales — la app funciona sin ninguna, solo que sin búsqueda extendida ni sync.

```bash
# Firebase — habilita auth con Google y sync en la nube
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Proveedores de búsqueda externos (opcionales; también se pueden meter desde Ajustes)
VITE_FRAGELLA_API_KEY=
VITE_FRAGRANCEFINDER_API_KEY=
```

Obtén las credenciales de Firebase en **Firebase Console → Project Settings → Web App**. Si falta alguna variable requerida, se emite un `console.warn` indicando cuáles y el sync queda deshabilitado.

---

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción (`tsc -b && vite build`) |
| `npm run preview` | Sirve la build localmente |
| `npm run lint` | ESLint con reglas type-aware (`recommendedTypeChecked` + `react-x` + `react-dom`) |
| `npm run typecheck` | Solo chequea tipos (`tsc -b --noEmit`) |
| `npm test` | Corre la suite de Vitest una vez |
| `npm run test:watch` | Vitest en modo watch |
| `npm run test:ui` | Abre la UI interactiva de Vitest |

Un hook `pre-commit` (husky + lint-staged) ejecuta ESLint sobre los archivos `.ts`/`.tsx` staged antes de cada commit.

---

## Estructura

```
src/
├── api/               Proveedores de búsqueda (Fragella, FragranceFinder, Parfumo local)
│   ├── search-orchestrator.ts    Orquesta todos los proveedores + dedupe
│   └── mappers.ts                Normaliza respuestas a tipos internos
├── components/
│   ├── collection/    Estanterías, overview, empty states
│   ├── layout/        AppShell, Sidebar, TopBar, MobileNav, AuthErrorBanner
│   └── perfume/       PerfumeCard, NotePyramid, AccordBar, etc.
├── data/              Seed catalog + estimaciones de precio UY + enrichment
├── db/
│   ├── database.ts    Schema Dexie
│   ├── hooks.ts       Hooks reactivos sobre Dexie
│   └── parfumo-loader.ts   Carga del dataset global (59K+)
├── firebase/
│   ├── AuthContext.ts       Context (tipo + createContext)
│   ├── AuthProvider.tsx     Provider con lógica de auth + sync
│   ├── useAuth.ts           Hook consumidor
│   ├── config.ts            Init condicional según env vars
│   └── sync.ts              Merge cloud ⇄ local con listeners real-time
├── lib/               Utilidades puras (`cn`, `generateSlug`, `formatUYU`)
├── pages/             HomePage, ShelfPage, PerfumePage, SearchPage, AddManualPage, SettingsPage
├── test/              Setup de Vitest
└── types/             Tipos compartidos (`Perfume`, `ShelfPerfume`, etc.)
```

### Flujo de datos

1. **Primer arranque:** seed del catálogo local → importación Fragrantica → enrichment → inferencia de scores.
2. **Login con Google:** merge bidireccional entre Dexie y Firestore (cloud gana en perfumes, entrada más reciente gana en colección). Se registran listeners real-time.
3. **Logout:** se detienen los listeners y se limpia Dexie (multi-cuenta en el mismo dispositivo).

---

## Tests

Stack: **Vitest** + **@testing-library/react** + **jsdom**.

- Tests unitarios viven junto al código (`*.test.ts` / `*.test.tsx`).
- Setup compartido en `src/test/setup.ts` (importa `@testing-library/jest-dom/vitest`).
- Config en `vite.config.ts` (bloque `test`).

Ejemplos actuales:
- `src/lib/utils.test.ts` — `generateSlug`, `formatUYU`, `cn`
- `src/api/search-orchestrator.test.ts` — `richnessScore`, `deduplicateAndMerge`
- `src/components/perfume/RatingStars.test.tsx` — smoke + interacción

---

## Despliegue

Configurado para **Netlify** (ver `netlify.toml`). Cualquier host de estáticos sirve: `npm run build` produce `dist/` con un SPA. Asegúrate de redirigir todo a `index.html` (lo que hace el bloque `[[redirects]]`).
