"use client";

import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";

// Dynamic imports to prevent SSR issues with document references
const Header = dynamic(() => import("./components/Header"), { ssr: false });
const Sidebar = dynamic(() => import("./components/Sidebar"), { ssr: false });
const RightSidebar = dynamic(() => import("./components/RightSidebar"), {
  ssr: false,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Head>
        <title>Dashboard – Robo Books</title>
      </Head>
      <div className="flex flex-col h-screen bg-gray-50">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          {/* give the main a right margin equal to your RightSidebar's width (e.g. 80px) */}
          <main className="flex-1 overflow-auto mr-20">{children}</main>
          <RightSidebar />
        </div>
      </div>
    </>
  );
}
