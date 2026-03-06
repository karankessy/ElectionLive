import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nepal Election 2082 — Live Results',
  description: 'Live election results for Nepal Federal Parliament FPTP seats, 2082 BS.',
  openGraph: {
    title: 'Nepal Election 2082 — Live Results',
    description: 'Live election results for Nepal Federal Parliament FPTP seats.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'dark' }}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
