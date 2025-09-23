"use client";

import React from "react";

// Print-only layout that bypasses the dashboard layout
// This ensures no header, sidebar, or other app shell elements are rendered
export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="print-root">
      {children}
    </div>
  );
}
