import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Poppins } from "next/font/google";
import "./globals.css";
import "./nprogress.css";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { Providers } from "@/components/providers";
import { ProgressBar } from "@/components/progress-bar";
import { ConnectionStatus } from "@/components/connection-status";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amey · Command Center",
  description: "Operations console for the Amey marketplace — live dispatch, driver supply, revenue, and safety.",
  icons: {
    icon: "/images/logo.webp",
  },
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${poppins.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground selection:bg-primary/20 selection:text-primary`}
      >
        <ProgressBar />
        <ConnectionStatus />
        <Providers>
          <SidebarConfigProvider>{children}</SidebarConfigProvider>
        </Providers>
      </body>
    </html>
  );
}
