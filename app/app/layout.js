// app/layout.js
export const metadata = {
  title: 'Treasury Dashboard',
  description: 'US Treasury yields powered by FRED',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
        {children}
      </body>
    </html>
  );
}
