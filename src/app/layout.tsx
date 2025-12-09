import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/ThemeProvider";
import QueryProvider from "@/providers/QueryProvider";
import { CrimeTypeProvider } from "@/context/CrimeTypeProvider";

const inter = Inter({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Muntinlupa Crime Map",
  description: "Emergency alert and crime tracking application",
  icons: {
    icon: "/munti-crime-map-logo.svg", // or "/icon.png"
    apple: "/munti-crime-map-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CrimeTypeProvider>{children}</CrimeTypeProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
