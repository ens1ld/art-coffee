import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProfileProvider from "@/components/ClientProfileProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Art Coffee",
  description: "Your new favourite coffee shop",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClientProfileProvider>
          {children}
        </ClientProfileProvider>
      </body>
    </html>
  );
}
