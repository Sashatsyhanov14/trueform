import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: "TrueForm — Биомеханический анализ осанки и физического состояния",
  description: "Пройдите профессиональный экспресс-анализ вашей осанки, тонуса мышц и получите рекомендации кинезиолога по одной фотографии за 1 минуту.",
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
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
