# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

With Joyful Lips — a Progressive Web App for hymn music streaming and discovery. Built with React 19 + TypeScript + Vite, using Material-UI for the component library.

## Commands

```bash
npm run dev       # Start dev server at localhost:5173 (proxies /api to localhost:3000)
npm run build     # TypeScript check (tsc -b) then Vite production build to dist/
npm run lint      # ESLint (v9 flat config)
npm run preview   # Preview production build locally
```

No test runner is configured.

## Architecture

### Provider Hierarchy (App.tsx)

`ThemeProvider` → `BrowserRouter` → `AuthProvider` → `AudioPlayerProvider` → `PlaylistProvider` → Routes

All pages are lazy-loaded. Login/PhoneAuth routes are outside the `AppShell` layout; all other routes render inside `AppShell` (which provides TopAppBar, SideNav, BottomNav, MiniPlayer/FullPlayer).

### Key Patterns

- **API Client** (`src/api/client.ts`): Axios instance with JWT auth interceptor and automatic 401 token refresh with request queuing. Dispatches `auth:logout` window event on refresh failure. Token keys: `wjl_access_token`, `wjl_refresh_token`.
- **Audio Player** (`src/context/AudioPlayerContext.tsx`): Uses `useSyncExternalStore` with a ref-based store for playback position to avoid excessive re-renders.
- **Playlists** (`src/context/PlaylistContext.tsx` + `src/utils/playlistDb.ts`): Persisted to IndexedDB via the `idb` library for offline support.
- **Theme**: Light/dark mode via MUI's `createTheme`, with custom palette in `src/theme/colors.ts` and gradients in `src/theme/gradients.ts`. Respects system preference, stores user choice in localStorage.
- **Data mapping**: API responses are normalized through mapping functions (e.g., `mapSong` in `src/api/songs.ts`) before reaching components.

### Directory Layout

- `src/api/` — Axios client and endpoint modules (auth, songs, categories, user)
- `src/context/` — React Context providers (Auth, AudioPlayer, Playlist)
- `src/pages/` — Route-level page components (lazy-loaded)
- `src/components/` — Reusable components organized by feature: `layout/`, `player/`, `songs/`, `playlist/`, `common/`
- `src/hooks/` — Custom hooks (useInstallPrompt, useMediaSession)
- `src/types/` — TypeScript interfaces (Song, Category, User, API responses)
- `src/theme/` — MUI theme factory, colors, gradients
- `src/utils/` — Helpers (localStorage, IndexedDB, formatters, greeting)
- `public/sw.js` — Service Worker for PWA offline support

### Environment Variables

All prefixed with `VITE_` (exposed to client via `import.meta.env`):
- `VITE_API_BASE_URL` — Backend API base (default: `http://localhost:3000/api/web/v1`)
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` — Firebase config
- `VITE_GOOGLE_CLIENT_ID` — Google OAuth client ID

### TypeScript

Strict mode is enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, and `erasableSyntaxOnly`. The build will fail on unused variables/parameters.

### Responsive Breakpoints

Mobile-first design. Desktop sidebar appears at ≥768px. A TV/large-screen mode activates at ≥1920px.

### Build Optimization

Vite is configured with manual chunks: `vendor` (react, react-dom, react-router-dom), `mui` (@mui/material, @mui/icons-material), `firebase` (firebase/app, firebase/auth).
