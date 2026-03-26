import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "VC Jargon Translator — What VCs Actually Mean",
  description:
    "Decode VC emails, rejections, and pitch meeting phrases. Find out what investors really mean when they say 'We'd love to stay in touch.'",
  openGraph: {
    title: "VC Jargon Translator — What VCs Actually Mean",
    description:
      "Decode VC emails, rejections, and pitch meeting phrases into brutally honest translations.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VC Jargon Translator — What VCs Actually Mean",
    description:
      "Paste a VC email. Get the real translation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
