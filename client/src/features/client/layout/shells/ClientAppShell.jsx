import ClientShell from './ClientShell.jsx'

function ClientAppShell({ header, children, fullHeight = false }) {
  return (
    <ClientShell header={header} fullHeight={fullHeight}>
      {children}
    </ClientShell>
  )
}

export default ClientAppShell
