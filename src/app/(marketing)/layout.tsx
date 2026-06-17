import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-sans-devanagari",
  weight: ["400", "500", "600", "700"],
  subsets: ["devanagari"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://diagnoverse.ai"),
  title: "Diagnoverse AI — Rural Health Accessibility Platform",
  description:
    "AI-powered health diagnostic and tracking platform designed for rural health accessibility. Features vision scan, cough analysis, skin scan, and mental health screening.",
  icons: {
    icon: "/icon.svg",
  },
  alternates: {
    languages: {
      "en-IN": "https://diagnoverse.ai/en",
      "hi-IN": "https://diagnoverse.ai/hi",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Diagnoverse AI",
        url: "https://diagnoverse.ai",
        logo: "https://diagnoverse.ai/icon.svg",
        description:
          "AI-powered health diagnostic and tracking platform designed for rural health accessibility.",
      },
      {
        "@type": "MedicalWebPage",
        name: "Diagnoverse AI — Rural Health Accessibility Platform",
        description:
          "AI-powered health diagnostic and tracking platform designed for rural health accessibility. Features vision scan, cough analysis, skin scan, and mental health screening.",
        url: "https://diagnoverse.ai",
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${notoSansDevanagari.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
