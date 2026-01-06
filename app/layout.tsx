import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Membership Analytics Dashboard",
  description: "Comprehensive analysis of your marketing and sales pipeline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
