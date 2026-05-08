import ArtistAuthShellPage from '../components/ArtistAuthShellPage.jsx'
import { artistRegisterPageContent } from '../../../features/artist/artistPageContent.js'

function ArtistRegisterPage() {
  return <ArtistAuthShellPage content={artistRegisterPageContent} />
}

export default ArtistRegisterPage
