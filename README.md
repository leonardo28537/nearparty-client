# NearParty — Frontend (React + Vite)

## Stack
- **React 18** + **Vite** — fast dev server, HMR
- **React Router v6** — file-based routing
- **Zustand** — global state (auth, events, chat)
- **Axios** — REST calls with JWT interceptors + auto-refresh
- **Socket.io-client** — real-time chat
- **Mapbox GL JS** — interactive map + location picker
- **TailwindCSS** — utility-first styling
- **date-fns** — date formatting
- **react-hot-toast** — toast notifications

## Setup

```bash
cd nearparty-client
cp .env.example .env
# Fill in VITE_MAPBOX_TOKEN with your token from https://mapbox.com
npm install
npm run dev
```

The dev server proxies `/api` and `/socket.io` to `http://localhost:4000` (the backend).

## Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx          # Top navigation bar
│   │   └── ProtectedRoute.jsx  # Auth guard
│   └── ui/
│       ├── EventCard.jsx       # Event card (compact + full)
│       └── RadiusSlider.jsx    # km/m radius selector
├── hooks/
│   ├── useGeolocation.js       # Browser geolocation
│   └── useSocket.js            # Socket.io init + listeners
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── events/
│   │   ├── MapPage.jsx         # Map + nearby events
│   │   └── EventDetailPage.jsx # Event details + apply
│   ├── dashboard/
│   │   ├── DashboardPage.jsx   # Host: manage events & applications
│   │   └── CreateEventPage.jsx # Create event with map picker
│   ├── chat/
│   │   └── ChatPage.jsx        # Real-time chat per event
│   └── profile/
│       └── ProfilePage.jsx
├── services/
│   ├── api.js                  # Axios instance + JWT interceptors
│   └── socket.js               # Socket.io singleton + helpers
├── stores/
│   ├── authStore.js            # Auth state (persisted)
│   ├── eventsStore.js          # Events state
│   └── chatStore.js            # Chat rooms state
└── App.jsx                     # Router + global providers
```

## Routes

| Path | Page | Auth |
|------|------|------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/map` | Map + nearby events | ✅ |
| `/events/:id` | Event detail + apply | ✅ |
| `/dashboard` | Host dashboard | ✅ |
| `/dashboard/new` | Create event | ✅ |
| `/chat/:eventId` | Event chat | ✅ |
| `/profile` | User profile | ✅ |

## Auth Flow
1. User logs in → receives `accessToken` + `refreshToken`
2. Tokens persisted in `localStorage` via Zustand persist middleware
3. Axios interceptor attaches `Authorization: Bearer <token>` to every request
4. On 401 → interceptor auto-refreshes token and retries the original request
5. On refresh failure → clears storage and redirects to `/login`

## Next steps (Fase 2)
- Connect real Mapbox token
- Integrate with backend API (Fase 1 backend)
- Add event images (Fase 4)
- Push notifications (Fase 4)
