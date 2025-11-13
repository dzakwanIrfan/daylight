import type { Metadata } from "next";
import { montserrat, tanHeadline } from "./fonts";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "DayLight - Find New Friends Today",
  description: "Daylight is a lifestyle platform connecting people through real life experiences, from dinners, coffee, billiard, book club, yoga and many more.",
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