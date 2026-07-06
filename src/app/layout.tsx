import type { Metadata } from "next";
import {
  EB_Garamond,
  Geist,
  Geist_Mono,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { ThemeProvider, themeScript } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Codon Landing v4 type system (specimen-catalog identity)
const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jbMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const DESCRIPTION =
  "Codon independently verifies research artifacts — code, datasets, and citations — so journals, labs, and AI systems can separate verified science from noise. Code reproducibility is live today; citation and dataset checks ship as Codon Preflight.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Codon — the integrity layer for science",
    template: "%s · Codon",
  },
  description: DESCRIPTION,
  applicationName: "Codon",
  keywords: [
    "reproducibility",
    "computational biology",
    "method verification",
    "research integrity",
    "verified code",
    "bioinformatics",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Codon",
    url: SITE_URL,
    title: "Codon — the integrity layer for science",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Codon — the integrity layer for science",
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} ${jakarta.variable} ${jbMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
