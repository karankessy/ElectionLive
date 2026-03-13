import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nepal Election 2082 — Live Results Dashboard',
  description: 'Live election results for Nepal Federal Parliament FPTP 165 seats, 2082 BS. Real-time seat counts, party standings, province breakdown, and constituency battles.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Nepal Election 2082 — Live Results Dashboard',
    description: 'Live election results for Nepal Federal Parliament FPTP 165 seats. Real-time updates every 60 seconds.',
    type: 'website',
    siteName: 'Nepal Election 2082',
  },
  twitter: {
    card: 'summary',
    title: 'Nepal Election 2082 — Live Results',
    description: 'Live election results for Nepal Federal Parliament FPTP seats.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark');document.documentElement.style.colorScheme='dark'}else{document.documentElement.setAttribute('data-theme','light');document.documentElement.style.colorScheme='light'}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
