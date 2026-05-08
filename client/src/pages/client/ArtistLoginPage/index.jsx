import ArtistAuthShellPage from '../components/ArtistAuthShellPage.jsx'
import { artistLoginPageContent } from '../../../features/artist/artistPageContent.js'

function ArtistLoginPage() {
  return <ArtistAuthShellPage content={artistLoginPageContent} />
}

export default ArtistLoginPage
