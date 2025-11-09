import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function PasswordReset() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resetData, setResetData] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email.trim()) {
      setError('Please enter your email address.')
      setLoading(false)
      return
    }

    fetch('/api/accounts/password-reset/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(async (res) => {
        const data = await res.json()
        setLoading(false)
        if (!res.ok) {
          setError(data.email ? data.email[0] : 'An error occurred')
          return
        }
        setSuccess(true)
        setResetData(data)
      })
      .catch((err) => {
        setLoading(false)
        setError('Network error: ' + err.message)
      })
  }

  if (success) {
    return (
      <div className="password-reset-wrap">
        <div className="password-reset-form">
          <h2>Email Sent!</h2>
          <div className="success-message">
            <p>Password reset email has been sent to your email address!</p>
            <p>Please check your email (including spam folder) for the reset instructions.</p>
            
            {resetData.debug_info && (
              <div className="reset-info">
                <p><strong>Development Debug Info:</strong></p>
                <div className="reset-details">
                  <p><strong>Token:</strong> <code>{resetData.debug_info.token}</code></p>
                  <p><strong>UID:</strong> <code>{resetData.debug_info.uid}</code></p>
                  <p><strong>Sent to:</strong> {resetData.debug_info.recipient}</p>
                </div>
                <p className="note">
                  Since we're in development mode, the email is printed to the server console.
                  Check your backend terminal to see the email content.
                </p>
              </div>
            )}
          </div>
          <div className="form-actions">
            <Link to="/password-reset-confirm">
              <button type="button" className="btn-primary">
                I Have the Reset Details
              </button>
            </Link>
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
    <div className="password-reset-wrap">
      <form className="password-reset-form" onSubmit={handleSubmit} noValidate>
        <h2>Reset Password</h2>
        <p className="form-description">
          Enter your email address and we'll send you password reset instructions.
        </p>
        
        {error && <div className="form-error">{error}</div>}

        <label>
          Email Address
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
          />
        </label>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Sending Email...' : 'Send Reset Email'}
        </button>

        <div className="form-footer">
          <p>Remember your password?</p>
          <Link to="/login">
            <button type="button" className="btn-secondary">Back to Login</button>
          </Link>
        </div>
      </form>
    </div>
  )
}