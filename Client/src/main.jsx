import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ✅ Add axios override here
import axios from 'axios'

// Use environment variable if available, otherwise fallback to localhost
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)