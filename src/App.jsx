import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './Login'
import Register from './registration'
import MainPage from './mainpage'
import PasswordReset from './PasswordReset'
import PasswordResetConfirm from './PasswordResetConfirm'
import ProfileGrid from './ProfileGrid.jsx'
import ProfilePage from './ProfilePage.jsx'
import NotificationsPage from './NotificationsPage.jsx'
import MyApplicationsPage from './MyApplicationsPage.jsx'
import BulkResumeAnalysisPage from './BulkResumeAnalysisPage.jsx'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth')
      if (raw) {
        const a = JSON.parse(raw)
        setUser({ username: a.username, email: a.email, token: a.token })
      }
    } catch (e) {}
  }, [])

  function handleLogin(u) {
    setUser(u)
  }

  function handleLogout() {
    try {
      const raw = localStorage.getItem('auth')
      const a = raw ? JSON.parse(raw) : null
      if (a && a.token) {
        fetch('/api/accounts/logout/', {
          method: 'POST',
          headers: { 'Authorization': `Token ${a.token}` },
        }).catch(() => {})
      }
      localStorage.removeItem('auth')
    } catch (e) {}
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <MainPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleLogin} />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/password-reset-confirm" element={<PasswordResetConfirm />} />
        <Route 
          path="/profiles" 
          element={
            user ? (
              <ProfileGrid user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            user ? (
              <ProfilePage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/notifications" 
          element={
            user ? (
              <NotificationsPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/applications" 
          element={
            user ? (
              <MyApplicationsPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/bulk-analysis" 
          element={
            user ? (
              <BulkResumeAnalysisPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App