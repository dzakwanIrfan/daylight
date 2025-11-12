import type { Metadata } from "next";
import { montserrat, tanHeadline } from "./fonts";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "DayLight - Connect Through Shared Experiences",
  description: "Meet new people over dinner based on personality compatibility",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${tanHeadline.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}