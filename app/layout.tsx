import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cloud IDE — Build in the cloud",
  description:
    "A modern cloud development environment for building, running, previewing, and deploying software from your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
