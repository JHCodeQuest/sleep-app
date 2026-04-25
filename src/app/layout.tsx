import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sleep Better",
  description: "Track your sleep and build healthy habits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-slate-900 text-slate-100 font-sans">
        <div className="flex flex-col h-full">{children}</div>
      </body>
    </html>
  );
}