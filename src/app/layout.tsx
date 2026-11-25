import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { SeshToaster } from '@/components/SeshToaster';
import { SettingsProvider } from '@/lib/settings';
import { SessionProvider } from '@/lib/sessions';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Sesh — Live skate spots in Lagos',
  description:
    'Find live skate spots across Lagos. See which plazas, stairs and rails have crews skating right now.',
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
            </SessionProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
