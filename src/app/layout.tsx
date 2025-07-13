import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import './premium-button.css';
import './signup-button.css';
import './login-button.css';
import './login-new.css';
import './search-bar.css';
import './loader.css';
import './campus-feed-card.css';
import './signup-new.css';
import { LoadingProvider } from '@/context/loading-context';

export const metadata: Metadata = {
  title: 'CampusConnect',
  description: 'Collaborate, innovate, and connect.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <LoadingProvider>
          {children}
          <Toaster />
        </LoadingProvider>
      </body>
    </html>
  );
}
