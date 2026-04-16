import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminPage from './AdminPage.jsx'

const currentPage = window.location.pathname.startsWith('/admin') ? <AdminPage /> : <App />

createRoot(document.getElementById('root')).render(
  currentPage,
)
