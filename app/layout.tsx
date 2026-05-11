import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NicheForge AI — AI Business Angle Reports",
  description:
    "Turn proven business models into sharper AI-automated niche opportunities.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
