const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export async function adminFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
  })

  if (response.status === 401 && path !== '/admin/login' && path !== '/admin/session') {
    window.dispatchEvent(new Event('admin-session-expired'))
  }

  return response
}
