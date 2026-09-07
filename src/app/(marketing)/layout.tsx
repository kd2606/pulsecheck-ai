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
  title: "CareSanchaar - Care that reaches. Coordination that connects.",
  description:
    "CareSanchaar is an offline-first public-health care-coordination platform that connects ASHA workers, Medical Officers, healthcare facilities, and district teams.",
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
        name: "CareSanchaar",
        url: "https://diagnoverse.ai",
        logo: "https://diagnoverse.ai/icon.svg",
        description:
          "CareSanchaar is an offline-first public-health care-coordination platform that connects ASHA workers, Medical Officers, healthcare facilities, and district teams across intake, triage, referral, queue, and follow-up workflows.",
      },
      {
        "@type": "MedicalWebPage",
        name: "CareSanchaar - Care that reaches. Coordination that connects.",
        description:
          "CareSanchaar is an offline-first public-health care-coordination platform that connects ASHA workers, Medical Officers, healthcare facilities, and district teams across intake, triage, referral, queue, and follow-up workflows.",
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
