import { useState } from 'react'
import './AdminLogin.css'
import { adminFetch } from '../../api'
import adminLoginIcon from '../../assets/ShopNiMarAdminLoginIcon.png'

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await adminFetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Unable to sign in. Please try again.')
        return
      }

      setPassword('')
      onLogin()
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-orb admin-login-orb-one" aria-hidden="true" />
      <div className="admin-login-orb admin-login-orb-two" aria-hidden="true" />
      <div className="admin-login-layout">
        <aside className="admin-login-showcase" aria-label="Shop Ni Mar admin portal">
          <div className="admin-login-showcase-badge">
            <span aria-hidden="true" />
            ADMIN PORTAL
          </div>
          <div className="admin-login-icon-frame">
            <img src={adminLoginIcon} alt="Shop Ni Mar admin logo" />
          </div>
          <div className="admin-login-showcase-copy">
            <p className="admin-login-showcase-title">Your shop,<br />beautifully managed.</p>
            <p>Manage products, offers, and inventory from one secure dashboard.</p>
          </div>
        </aside>

        <section className="admin-login-card" aria-labelledby="admin-login-title">
          <div className="admin-login-brand">SHOP NI MAR</div>
          <p className="admin-login-eyebrow">STORE MANAGEMENT</p>
          <h1 id="admin-login-title">Welcome back</h1>
          <p className="admin-login-intro">Sign in to manage your shop.</p>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />

            <label htmlFor="admin-password">Password</label>
            <div className="admin-login-password-wrap">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                className="admin-login-password-toggle"
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {error && <p className="admin-login-error" role="alert">{error}</p>}

            <button className="admin-login-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="admin-login-secure-note">
            Protected admin access. Your session is secured with an HTTP-only cookie.
          </p>
        </section>
      </div>
    </main>
  )
}

export default AdminLogin
