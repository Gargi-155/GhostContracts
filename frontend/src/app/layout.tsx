
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ghost Contracts | Legal Intelligence",
    template: "%s | Ghost Contracts",
  },
  description:
    "Understand your contracts with AI-assisted risk analysis, clear explanations, and actionable insights.",
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