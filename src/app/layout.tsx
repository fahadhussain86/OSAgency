import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgencyOS | Agency operations, elevated",
  description: "The operating system for modern agencies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
