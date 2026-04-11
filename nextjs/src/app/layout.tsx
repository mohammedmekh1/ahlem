import type { Metadata } from "next";
import "./globals.css";
import "@/lib/i18n";

export const metadata: Metadata = {
  title: "EXAM - منصة التعليم الإلكتروني",
  description: "منصة EXAM المتكاملة للتعليم الإلكتروني وإدارة الاختبارات والدورات التدريبية",
  keywords: "تعليم إلكتروني, اختبارات, دورات, EXAM, e-learning",
  authors: [{ name: "EXAM Platform" }],
  openGraph: {
    title: "EXAM - منصة التعليم الإلكتروني",
    description: "منصة متكاملة للتعليم الإلكتروني وإدارة الاختبارات",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="auto">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Cairo:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
