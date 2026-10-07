import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import Script from "next/script";
import { SerwistProvider } from "@serwist/turbopack/react";
import { Provedores } from "@/components/provedores";
import { SCRIPT_TEMA } from "@/lib/tema-script";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: "800",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Zerei",
  description: "Tudo que você zerou, assistiu e montou.",
  applicationName: "Zerei",
  appleWebApp: {
    capable: true,
    title: "Zerei",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ECEAE1" },
    { media: "(prefers-color-scheme: dark)", color: "#121318" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${bricolage.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Script id="tema" strategy="beforeInteractive">
          {SCRIPT_TEMA}
        </Script>
        {/* Em desenvolvimento o service worker fica desligado para não servir telas velhas */}
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV === "development"}
        >
          <Provedores>{children}</Provedores>
        </SerwistProvider>
      </body>
    </html>
  );
}
