import { useState } from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter email and password.')
      return
    }

    // Very small demo authentication: accept any email/password for now.
    // In a real app you'd call your API here.
    const user = { email }
    try {
      localStorage.setItem('user', JSON.stringify(user))
    } catch (e) {
      // ignore storage errors in demo
    }

    onLogin(user)
  }

  return (
    <div className="login-wrap">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Log in</h2>
        {error && <div className="login-error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            required
          />
        </label>

        <button type="submit" className="btn-primary">Sign in</button>
      </form>
    </div>
  )
}
