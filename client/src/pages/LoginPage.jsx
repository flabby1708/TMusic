import AuthPageShell from '../features/auth/AuthPageShell.jsx'
import { loginPageContent } from '../features/auth/authPageContent.js'

function LoginPage() {
  return <AuthPageShell {...loginPageContent} />
}

export default LoginPage
