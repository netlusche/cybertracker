import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div className="cyber-loading">INITIALIZING NEURAL LINK...</div>}>
      <App />
    </Suspense>
  </StrictMode>,
)
