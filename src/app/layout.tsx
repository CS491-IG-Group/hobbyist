export const metadata = {
  title: 'orbit.r — Explore niche hubs in your orbit',
  description: 'Explore niche hubs in your orbit',
}

import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
