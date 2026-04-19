import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminPage from './AdminPage.jsx'
import AuthCallbackPage from './pages/AuthCallbackPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

const pathname = window.location.pathname

let currentPage = <App />

if (pathname.startsWith('/admin')) {
  currentPage = <AdminPage />
} else if (pathname.startsWith('/auth/callback')) {
  currentPage = <AuthCallbackPage />
} else if (pathname.startsWith('/login')) {
  currentPage = <LoginPage />
} else if (pathname.startsWith('/register')) {
  currentPage = <RegisterPage />
}

createRoot(document.getElementById('root')).render(
  currentPage,
)
