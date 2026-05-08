import AuthShellPage from '../components/AuthShellPage.jsx'
import { loginPageContent } from '../../../features/auth/authPageContent.js'

function LoginPage() {
  return <AuthShellPage content={loginPageContent} />
}

export default LoginPage
