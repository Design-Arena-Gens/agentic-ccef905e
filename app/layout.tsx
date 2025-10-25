import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UGC Fashion Creator',
  description: 'Créateur de contenu UGC pour la mode',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
