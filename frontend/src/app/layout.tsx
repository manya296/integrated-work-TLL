import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Async Execution System | TrustLayer Labs",
  description: "Enterprise API Security Testing Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html lang="en">
=======
    <html lang="en" className="dark">
>>>>>>> abcfc051e5e420f24edeada950b08e54fa460a1f
      <body className={`${inter.variable} antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
