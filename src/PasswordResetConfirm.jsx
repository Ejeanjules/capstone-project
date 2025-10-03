import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function PasswordResetConfirm() {
  const [uid, setUid] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!uid.trim() || !token.trim() || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      setLoading(false)
      return
    }

    fetch('http://127.0.0.1:8000/api/accounts/password-reset-confirm/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword
      }),
    })
      .then(async (res) => {
        const data = await res.json()
        setLoading(false)
        if (!res.ok) {
          const errorMessage = data.non_field_errors 
            ? data.non_field_errors[0] 
            : data.uid 
            ? data.uid[0]
            : data.token
            ? data.token[0]
            : data.new_password
            ? data.new_password[0]
            : 'An error occurred'
          setError(errorMessage)
          return
        }
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
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
          <h2>Password Reset Successful</h2>
          <div className="success-message">
            <p>Your password has been reset successfully!</p>
            <p>You will be redirected to the login page in a few seconds...</p>
          </div>
          <Link to="/login">
            <button type="button" className="btn-primary">
              Go to Login Now
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="password-reset-wrap">
      <form className="password-reset-form" onSubmit={handleSubmit} noValidate>
        <h2>Set New Password</h2>
        <p className="form-description">
          Enter the reset details from your email and choose a new password.
        </p>
        
        {error && <div className="form-error">{error}</div>}

        <label>
          User ID (UID)
          <input
            type="text"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="Copy UID from your email"
            disabled={loading}
          />
        </label>

        <label>
          Reset Token
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Copy token from your email"
            disabled={loading}
          />
        </label>

        <label>
          New Password
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 8 characters)"
            disabled={loading}
          />
        </label>

        <label>
          Confirm New Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            disabled={loading}
          />
        </label>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <div className="form-footer">
          <Link to="/login">
            <button type="button" className="btn-secondary">Back to Login</button>
          </Link>
        </div>
      </form>
    </div>
  )
}