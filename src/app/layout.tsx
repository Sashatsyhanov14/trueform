import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-J4LP073K7C";

export const metadata: Metadata = {
  title: "TrueForm — ИИ-анализ осанки и состояния тела онлайн",
  description: "Бесплатный биомеханический экспресс-анализ осанки, мышечного тонуса и симметрии тела по одной фотографии за 1 минуту с помощью искусственного интеллекта.",
  keywords: ["анализ осанки", "проверка осанки онлайн", "нейросеть для осанки", "биомеханика тела", "тест на сколиоз онлайн", "оценка тонуса мышц", "TrueForm AI"],
  authors: [{ name: "TrueForm AI" }],
  creator: "TrueForm AI",
  publisher: "TrueForm AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://trueformai.ru",
  },
  metadataBase: new URL("https://trueformai.ru"),
  openGraph: {
    title: "TrueForm — Биомеханический анализ осанки и тела",
    description: "Узнайте состояние вашей осанки, симметрию плеч и тонус мышц по одному фото с помощью искусственного интеллекта.",
    url: "https://trueformai.ru",
    siteName: "TrueForm",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrueForm — Биомеханический анализ осанки",
    description: "Узнайте состояние вашей осанки и тонус мышц по одному фото.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "TrueForm AI",
  "url": "https://trueformai.ru",
  "description": "ИИ-платформа для биомеханического анализа осанки и физического состояния тела по фотографии.",
  "applicationCategory": "HealthAndFitnessApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "RUB"
  }
};

import { Suspense } from "react";
import { PostHogProvider, PostHogPageView } from "@/providers/PostHogProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
        <PostHogProvider>{children}</PostHogProvider>
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
