import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plataforma PSI",
  description: "Plataforma SaaS para psicólogos e clínicas de psicologia",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-br" className={geistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
