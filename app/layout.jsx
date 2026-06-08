import './globals.css';
import Providers from '@/components/providers';
import LeafCursor from '@/components/LeafCursor';

export const metadata = {
  title: 'SimaTrack — Sima Arome Tracking System',
  description: 'Sistem terpadu pelacakan bahan baku dan produksi Sima Arome',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <LeafCursor />
      </body>
    </html>
  );
}
