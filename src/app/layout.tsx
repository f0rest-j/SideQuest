import type { Metadata, Viewport } from "next";
import "@fontsource-variable/space-grotesk";
import "./globals.css";

export const metadata: Metadata = {
  title: "SideQuest",
  description: "Your life is the open world. Small real-world quests, real XP.",
  applicationName: "SideQuest",
};

export const viewport: Viewport = {
  themeColor: "#0b0d0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
