import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Register({ onRegister }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [registeredUser, setRegisteredUser] = useState(null)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // POST to backend registration endpoint (token-based)
    fetch('/api/accounts/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          // try to surface server validation errors
          const msg = data && (data.detail || data.non_field_errors || data.username || data.email || data.password)
          setError(typeof msg === 'string' ? msg : JSON.stringify(msg))
          return
        }

        // successful registration - store auth token and user
        const auth = { token: data.token, username: data.username, email: data.email }
        try {
          localStorage.setItem('auth', JSON.stringify(auth))
        } catch (e) {}
        
        // Show success message
        setRegisteredUser(auth)
        setSuccess(true)
        
        // Automatically redirect after 3 seconds
        setTimeout(() => {
          onRegister({ username: auth.username, email: auth.email, token: auth.token })
          navigate('/')
        }, 3000)
      })
      .catch((err) => setError('Network error: ' + err.message))
  }

  if (success) {
    return (
      <div className="register-wrap">
        <div className="register-form">
          <h2>Registration Successful!</h2>
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h3>Welcome, {registeredUser.username}!</h3>
            <p>You have successfully created your account.</p>
            <div className="account-details">
              <p><strong>Username:</strong> {registeredUser.username}</p>
              <p><strong>Email:</strong> {registeredUser.email}</p>
            </div>
            <p className="redirect-message">
              You will be automatically redirected to your dashboard in a few seconds...
            </p>
          </div>
          <div className="success-actions">
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => {
                onRegister({ username: registeredUser.username, email: registeredUser.email, token: registeredUser.token })
                navigate('/')
              }}
            >
              Go to Dashboard Now
            </button>
            <Link to="/login">
              <button type="button" className="btn-secondary">
                Back to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="register-wrap">
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <h2>Register</h2>
        {error && <div className="register-error">{error}</div>}

        <label>
          Username
          <input
            type="text"
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your username"
          />
        </label>

        <label>
          Email
          <input
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </label>

        <label>
          Confirm Password
          <input
            type="password"
            autoComplete="off"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="confirm password"
          />
        </label>

        <button type="submit" className="btn-primary">Sign up</button>

        <div className="register-footer">
          <p>Already have an account?</p>
          <Link to="/login">
            <button type="button" className="btn-secondary">Back to Login</button>
          </Link>
        </div>
      </form>
    </div>
  )
}