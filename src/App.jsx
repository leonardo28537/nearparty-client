import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { useSocket } from '@/hooks/useSocket'
import { useAuthStore } from '@/stores/authStore'

import { ProtectedRoute }    from '@/components/layout/ProtectedRoute'
import { Navbar }            from '@/components/layout/Navbar'

import { LoginPage }         from '@/pages/auth/LoginPage'
import { RegisterPage }      from '@/pages/auth/RegisterPage'
import { MapPage }           from '@/pages/events/MapPage'
import { EventDetailPage }   from '@/pages/events/EventDetailPage'
import { DashboardPage }     from '@/pages/dashboard/DashboardPage'
import { CreateEventPage }   from '@/pages/dashboard/CreateEventPage'
import { ChatPage }          from '@/pages/chat/ChatPage'
import { ProfilePage }       from '@/pages/profile/ProfilePage'

// Connect socket once globally when authenticated
const SocketInitializer = () => {
  useSocket()
  return null
}

export default function App() {
  const { isAuthenticated } = useAuthStore()
  const authenticated = isAuthenticated()

  return (
    <BrowserRouter>
      {authenticated && <SocketInitializer />}

      <Routes>
        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — with Navbar */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Routes>
                  <Route path="/map"                    element={<MapPage />} />
                  <Route path="/events/:id"             element={<EventDetailPage />} />
                  <Route path="/dashboard"              element={<DashboardPage />} />
                  <Route path="/dashboard/new"          element={<CreateEventPage />} />
                  <Route path="/dashboard/events/:id"   element={<DashboardPage />} />
                  <Route path="/chat"                   element={<Navigate to="/map" replace />} />
                  <Route path="/chat/:eventId"          element={<ChatPage />} />
                  <Route path="/profile"                element={<ProfilePage />} />
                  <Route path="/"                       element={<Navigate to="/map" replace />} />
                  <Route path="*"                       element={<Navigate to="/map" replace />} />
                </Routes>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#201e17',
            color:      '#e8e6de',
            border:     '1px solid rgba(170,166,148,0.15)',
            fontFamily: '"DM Sans", sans-serif',
            fontSize:   '13px',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#ffcc4d', secondary: '#201e17' } },
          error:   { iconTheme: { primary: '#ff6044', secondary: '#201e17' } },
        }}
      />
    </BrowserRouter>
  )
}
