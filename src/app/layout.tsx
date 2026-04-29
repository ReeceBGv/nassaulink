import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NassauLink — Find Local Businesses in The Bahamas",
  description: "The smartest way to find verified local businesses in Nassau and across The Bahamas. Call or WhatsApp directly — no endless searching.",
  keywords: ["Nassau business directory", "Bahamas local businesses", "Nassau plumber", "Bahamas catering", "Nassau auto repair"],
  openGraph: {
    title: "NassauLink — Find Local Businesses in The Bahamas",
    description: "Verified local businesses you can call or WhatsApp instantly.",
    type: "website",
    locale: "en_BS",
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
      className={`${poppins.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
