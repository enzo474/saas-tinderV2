import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "Crushmaxxing - Optimise ton profil Tinder",
  description: "Obtiens une analyse IA de ton profil et découvre exactement ce qui t'empêche d'avoir plus de matchs.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/Crushmaxxing_fav.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Crushmaxxing - Optimise ton profil Tinder',
    description: "Obtiens une analyse IA de ton profil et découvre exactement ce qui t'empêche d'avoir plus de matchs.",
    images: [{ url: '/Crushmaxxing_fav.png', width: 512, height: 512 }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Crushmaxxing - Optimise ton profil Tinder',
    description: "Obtiens une analyse IA de ton profil et découvre exactement ce qui t'empêche d'avoir plus de matchs.",
    images: ['/Crushmaxxing_fav.png'],
  },
  other: {
    'theme-color': '#0A0A0A',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileImage': '/Crushmaxxing_fav.png',
    'msapplication-TileColor': '#0A0A0A',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.body.removeAttribute('cz-shortcut-listen');}catch(e){}})();`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
