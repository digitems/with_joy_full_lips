# With Joyful Lips

A Progressive Web App for hymn music streaming and discovery. Worship, praise, and gospel music for every moment.

**Live**: [joyfullips.com](https://joyfullips.com)

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build**: Vite 7
- **UI**: Material UI 7 + Emotion + Framer Motion
- **Routing**: React Router DOM v7 (lazy-loaded pages)
- **Auth**: Email/password, Google Sign-In, Firebase Phone OTP
- **HTTP**: Axios with JWT interceptor & auto-refresh
- **Offline**: Service worker + IndexedDB (via `idb`)

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- Backend server running ([joyfulcore](https://github.com/digitems/joyfulcore))

### Setup

```bash
git clone git@github.com:digitems/with_joy_full_lips.git
cd with_joy_full_lips
npm install
cp .env.example .env    # Fill in your API keys
npm run dev              # http://localhost:5173
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 5173, proxies `/api` to `localhost:3000`) |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | ESLint (flat config v9) |

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_FIREBASE_API_KEY` | Firebase API key (phone auth) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_GOOGLE_CLIENT_ID` | Google Sign-In client ID |
| `VITE_ADSENSE_CLIENT_ID` | Google AdSense client ID |
| `VITE_AD_SLOT_*` | AdSense slot IDs (leaderboard, infeed, sidebar, mobile banner) |

## Project Structure

```
src/
├── api/            # Axios client + domain API modules (auth, songs, user, categories, ads)
├── components/
│   ├── ads/        # Ad slots, consent banner, self-served ads
│   ├── common/     # SEOHead, SearchBar, AuthRequiredDialog, RatingDialog
│   ├── layout/     # AppShell, TopAppBar, SideNav, BottomNav
│   ├── player/     # FullPlayer, MiniPlayer, PlayerControls, ProgressBar, VinylDisk
│   ├── playlist/   # Playlist cards, create/select sheets
│   └── songs/      # SongCard, SongListItem, CategorySection
├── context/        # AuthContext, AudioPlayerContext, PlaylistContext
├── hooks/          # useMediaSession, useInstallPrompt, useAdExperiment
├── pages/          # Route pages (lazy-loaded)
├── theme/          # MUI theme, color palette, gradients
├── types/          # TypeScript interfaces (Song, User, Category, API)
└── utils/          # Storage helpers, IndexedDB wrapper, formatters
```

## Architecture

### State Management

Three React Contexts — no external state library:

- **AuthContext** — Login, registration, session restoration, guest mode. Listens for forced logout from the API interceptor.
- **AudioPlayerContext** — Playback, queue, shuffle/repeat. Position tracked via `useSyncExternalStore` + `requestAnimationFrame` (not React state) for smooth updates without re-renders.
- **PlaylistContext** — Local playlist CRUD persisted in IndexedDB.

### API Layer

`src/api/client.ts` creates an Axios instance with:
- Auto-attached JWT from localStorage (`wjl_access_token`)
- 401 response interceptor that refreshes tokens and queues pending requests
- `auth:logout` event dispatch on refresh failure

Domain modules (`auth`, `songs`, `user`, `categories`, `ads`) provide typed wrappers around the client.

### Authentication

| Method | Flow |
|--------|------|
| Email/password | Direct API call to backend |
| Google Sign-In | GSI SDK (loaded in `index.html`) → ID token sent to backend |
| Phone OTP | Firebase Auth SDK → Firebase ID token sent to backend |
| Guest mode | Browse-only, no server auth required |

### PWA

- **Service worker** (`public/sw.js`): Network-first for navigation, stale-while-revalidate for assets, no API caching
- **Manifest**: Standalone display, "Aged Hymnal" theme colors
- **Install prompt**: Handled via `useInstallPrompt` hook

## Author

**AnointTech**
