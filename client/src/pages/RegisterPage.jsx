import AuthPageShell from '../features/auth/AuthPageShell.jsx'
import { registerPageContent } from '../features/auth/authPageContent.js'

function RegisterPage() {
  return <AuthPageShell {...registerPageContent} />
}

export default RegisterPage
