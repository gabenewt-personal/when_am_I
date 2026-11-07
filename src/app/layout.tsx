import type { Metadata, Viewport } from "next";
import { Literata, Pixelify_Sans, Press_Start_2P } from "next/font/google";
import "./globals.css";

const display = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const ui = Pixelify_Sans({ subsets: ["latin"], variable: "--font-ui" });
const prose = Literata({ subsets: ["latin"], variable: "--font-prose", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "When Am I? — a daily mystery through time",
  description: "Wake somewhere in history. Read six fragments. Work out when you are.",
  appleWebApp: { capable: true, title: "When Am I?", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#151b17",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable} ${prose.variable}`}>
      <body>{children}</body>
    </html>
  );
}
