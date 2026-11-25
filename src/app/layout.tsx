import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import InstallBanner from '@/components/InstallBanner';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import { SeshToaster } from '@/components/SeshToaster';
import { SettingsProvider } from '@/lib/settings';
import { SessionProvider } from '@/lib/sessions';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const TITLE = 'Sesh | Live skate spots in Lagos';
const DESCRIPTION =
  'Find live skate spots across Lagos. See which plazas, stairs and rails have crews skating right now.';

export const metadata: Metadata = {
  title: { default: TITLE, template: '%s | Sesh' },
  description: DESCRIPTION,
  applicationName: 'Sesh',
  manifest: '/manifest.webmanifest',
  // viewport-fit=cover lets the app draw under the iPhone notch and home bar
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: '#FF5A1F',
  appleWebApp: {
    capable: true,
    title: 'Sesh',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Sesh',
    type: 'website',
    images: [{ url: '/icons/icon-512.png', width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const themeScript = `
(function() {
  try {
    var raw = localStorage.getItem('sesh-settings');
    var settings = raw ? JSON.parse(raw) : { theme: 'auto', themeAutoRules: { night: { start: '18:00', end: '06:00' } } };
    var mode = settings.theme || 'auto';
    var theme = mode;
    if (mode === 'auto') {
      var h = new Date().getHours();
      var nightStart = 18;
      var nightEnd = 6;
      if (settings.themeAutoRules && settings.themeAutoRules.night) {
        nightStart = parseInt(settings.themeAutoRules.night.start.split(':')[0], 10);
        nightEnd = parseInt(settings.themeAutoRules.night.end.split(':')[0], 10);
      }
      // Night spans midnight, so check if hour >= nightStart OR hour < nightEnd
      theme = (h >= nightStart || h < nightEnd) ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <SettingsProvider>
            <SessionProvider>
              {children}
              <SeshToaster />
              <InstallBanner />
              <ServiceWorkerRegister />
            </SessionProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
