import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Crushmaxxing - Optimise ton profil Tinder",
  description: "Obtiens une analyse IA de ton profil et découvre exactement ce qui t'empêche d'avoir plus de matchs.",
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
