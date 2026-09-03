import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Maharashtra Engineering College Fees & Admission 2026–27",
  description: "Find Maharashtra engineering college fee structures, required documents, admission procedures and official PDFs for 2026–27 admission cycle.",
  keywords: ["Maharashtra engineering", "CAP 2026", "college fees", "MHT CET", "admission documents"],
  openGraph: {
    title: "Maharashtra Engineering College Fees & Admission 2026–27",
    description: "Search 55+ colleges — fee structure category-wise, document checklist, admission process & original PDFs.",
  }
};

export default function RootLayout({ children }: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-zinc-100">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
