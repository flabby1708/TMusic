import AuthCallbackStatus from '../../../features/auth/callback/AuthCallbackStatus.jsx'
import { useAuthCallbackSession } from '../../../features/auth/callback/useAuthCallbackSession.js'

function AuthCallbackPage() {
  const { error, message } = useAuthCallbackSession()

  return <AuthCallbackStatus error={error} message={message} />
}

export default AuthCallbackPage
