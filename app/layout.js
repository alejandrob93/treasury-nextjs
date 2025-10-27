export const metadata = {
  title: 'Treasury Dashboard',
  description: 'Next.js project',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
