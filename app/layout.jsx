"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Header from "@/components/common-components/header";
import { Toaster } from "@/components/ui/sonner";
import { Provider } from "react-redux";
import store from "@/store";
import { Suspense } from "react";
import { InstagramIcon, LinkedinIcon } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <Provider store={store}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <div className="flex flex-col w-full min-h-screen">
              <Header />
              <main className="w-full p-4 pt-5 pb-24">{children}</main>
              <footer className="backcolor-purpole text-white fixed bottom-0 z-50 w-full bg-white dark:bg-gray-900 border-t p-8">
                <div className="flex justify-between items-center text-xs md:text-[14px] ps-0 md:pl-10 ">
                  <div>
                    Copyright @ 2025 ZenWellness Lounge. Concept by{" "}
                    <Link
                      href="https://irepute.in/"
                      className="font-bold"
                      target="_blank"
                    >
                      repute
                    </Link>
                  </div>
                  <div className="flex gap-2 ps-1">
                    <Link
                      href="https://www.instagram.com/accounts/login/?next=%2Fzen_wellness_lounge%2F&source=omni_redirect"
                      target="_blank"
                      aria-label="Instagram"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </Link>
                    <Link
                      href="https://www.linkedin.com/in/zen-wellness-lounge-a50670348/"
                      target="_blank"
                      aria-label="LinkedIn"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
            <Toaster position="top-center" />
          </Suspense>
        </body>
      </html>
    </Provider>
  );
}
