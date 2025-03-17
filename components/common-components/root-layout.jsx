import React from "react";
// import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "../common-sidebar/side-menu";
import Navbar from "./navbar";
import { Link } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
// import "./globals.css";


export default function RootLayout({
  children,
}) {
  return (
    <>
      {/* <SidebarProvider> */}
      {/* <AppSidebar /> */}
      <div className="flex flex-col w-full">
        <Navbar />

        <main className="w-full p-4">{children}</main>

        <footer className="sticky bottom-0 z-50 w-full bg-white dark:bg-gray-900 border-t p-4">
          <p className="mb-0 md:text-sm text-xs">
            Copyright @ 2025 ZenWellness Lounge. Concept by{" "}
            <Link href="https://irepute.in/">repute</Link>
          </p>
        </footer>
      </div>
      {/* </SidebarProvider> */}
      <Toaster position="top-center" />
    </>
  );
}
