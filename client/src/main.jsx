import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { applyThemeConfig } from './themeConfig.js'
import './index.css'
import App from './App.jsx'

applyThemeConfig()

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
