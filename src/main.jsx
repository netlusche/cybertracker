import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import { ThemeProvider } from './utils/ThemeContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div className="cyber-loading">INITIALIZING NEURAL LINK...</div>}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Suspense>
  </StrictMode>,
);
