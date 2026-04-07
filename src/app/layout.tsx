import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "BookingPage — Schedule meetings effortlessly",
  description:
    "Connect your Google Calendar and share a personal booking page for meetings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
