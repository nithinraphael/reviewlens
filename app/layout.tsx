import type { Metadata } from 'next'
import { IBM_Plex_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'ReviewLens',
  description: 'Trustpilot review analysis workspace for analysts and executives.',
}

const BRootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html
    lang="en"
    className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
  >
    <body className="min-h-full bg-zinc-950 font-sans text-zinc-100">{children}</body>
  </html>
)

export default BRootLayout
