import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Admin from './Pages/Admin/Admin'
import AdminLogin from './Pages/AdminLogin/AdminLogin'
import { adminFetch } from './api'

const App = () => {
  const [authStatus, setAuthStatus] = useState('checking')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    adminFetch('/admin/session')
      .then((response) => {
        if (active) {
          setAuthStatus(response.ok ? 'authenticated' : 'unauthenticated')
        }
      })
      .catch(() => {
        if (active) {
          setAuthStatus('error')
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const handleExpiredSession = () => {
      setAuthStatus('unauthenticated')
      navigate('/login', { replace: true })
    }

    window.addEventListener('admin-session-expired', handleExpiredSession)
    return () => window.removeEventListener('admin-session-expired', handleExpiredSession)
  }, [navigate])

  const handleLogin = () => {
    setAuthStatus('authenticated')
    navigate('/addproduct', { replace: true })
  }

  const handleLogout = async () => {
    try {
      const response = await adminFetch('/admin/logout', { method: 'POST' })
      if (!response.ok) {
        throw new Error('The server could not end the admin session.')
      }
    } catch (error) {
      console.error('Admin logout failed:', error)
    } finally {
      setAuthStatus('unauthenticated')
      navigate('/login', { replace: true })
    }
  }

  if (authStatus === 'checking') {
    return <main className="admin-status">Checking admin session...</main>
  }

  if (authStatus === 'error') {
    return (
      <main className="admin-status" role="alert">
        <p>Could not reach the backend. Start the server and try again.</p>
        <button type="button" onClick={() => window.location.reload()}>Retry</button>
      </main>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={authStatus === 'authenticated'
          ? <Navigate to="/addproduct" replace />
          : <AdminLogin onLogin={handleLogin} />}
      />
      <Route
        path="*"
        element={authStatus === 'authenticated'
          ? <><Navbar onLogout={handleLogout} /><Admin /></>
          : <Navigate to="/login" replace state={{ from: location.pathname }} />}
      />
    </Routes>
  )
}

export default App
