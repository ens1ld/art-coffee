import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProfileFetcher from "@/components/ProfileFetcher";

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
  description: "Premium coffee ordering and loyalty service",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ProfileFetcher>
          {children}
        </ProfileFetcher>
      </body>
    </html>
  );
}
