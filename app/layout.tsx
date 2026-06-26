import { Toaster } from "sonner";
import type { Metadata, Viewport } from "next";
import { Mona_Sans } from "next/font/google";

import PwaRegister from "@/components/PwaRegister";

import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InterV | AI Mock Interview Coach",
  description:
    "Practice real interview questions with a voice-driven AI interviewer and get instant, actionable feedback.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "InterV",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#020408",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased pattern`}>
        {children}

        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}
