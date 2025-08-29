import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!form.email || !form.password) {
      setError('Please fill all fields!')
      setLoading(false)
      return
    }

    // Simulate API call delay
    setTimeout(() => {
      let users = JSON.parse(localStorage.getItem('ecobazaar_users') || '[]')
      const user = users.find(u => u.email === form.email && u.password === form.password)
      
      if (user) {
        // Store user session
        localStorage.setItem('ecobazaar_user', JSON.stringify(user))
        navigate('/dashboard')
      } else {
        setError('Invalid email or password!')
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🌱 Welcome Back</h2>
        <p className="subtitle">Sign in to EcoBazaarX</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '🔄 Signing In...' : '🔓 Sign In'}
          </button>
          
          <div className="auth-links">
            Don't have an account?{' '}
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate('/register')}
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
