import AuthCallbackStatus from './components/AuthCallbackStatus.jsx'
import { useAuthCallbackSession } from './useAuthCallbackSession.js'

function AuthCallbackPage() {
  const { error, message } = useAuthCallbackSession()

  return <AuthCallbackStatus error={error} message={message} />
}

export default AuthCallbackPage
