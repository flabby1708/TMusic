import ClientShell from './ClientShell.jsx'

function ClientPublicShell({ header, children }) {
  return (
    <ClientShell header={header}>
      {children}
    </ClientShell>
  )
}

export default ClientPublicShell
