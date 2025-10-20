export const metadata = {
  title: 'Treasury Yields — Live Dashboard',
  description: 'US Treasuries live yields with chart and 2s–10s spread',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
        {children}
      </body>
    </html>
  )
}
