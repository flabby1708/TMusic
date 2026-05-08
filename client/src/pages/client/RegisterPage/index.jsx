import AuthShellPage from '../components/AuthShellPage.jsx'
import { registerPageContent } from '../../../features/auth/authPageContent.js'

function RegisterPage() {
  return <AuthShellPage content={registerPageContent} />
}

export default RegisterPage
