import './globals.css';
import Providers from '@/components/providers';

export const metadata = {
  title: 'SimaTrack — Sima Arome Tracking System',
  description: 'Sistem terpadu pelacakan bahan baku dan produksi Sima Arome',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
