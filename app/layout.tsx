import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edge Portfolio",
  description: "Edge Portfolio trading and investment platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}