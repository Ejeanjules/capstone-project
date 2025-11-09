import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiUrl } from './config'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Please enter username and password.')
      return
    }

    fetch(getApiUrl('accounts/login/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          setError(data && (data.detail || data.non_field_errors || data))
          return
        }
        const auth = { token: data.token, username: data.username, email: data.email }
        try { localStorage.setItem('auth', JSON.stringify(auth)) } catch (e) {}
        onLogin({ username: auth.username, email: auth.email, token: auth.token })
        navigate('/')
      })
      .catch((err) => setError('Network error: ' + err.message))
  }

  return (
    <div className="login-wrap">
      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <h2>Log in</h2>
        {error && <div className="login-error">{error}</div>}

        <label>
          Username
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </label>

        <button type="submit" className="btn-primary">Sign in</button>

        <div className="login-footer">
          <div className="forgot-password">
            <Link to="/password-reset" className="forgot-link">
              Forgot your password?
            </Link>
          </div>
          <p>Don't have an account?</p>
          <Link to="/register">
            <button type="button" className="btn-secondary">Register</button>
          </Link>
        </div>
      </form>
    </div>
  )
}