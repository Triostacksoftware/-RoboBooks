import React from "react";
import DocumentsOverview from "./components/DocumentsOverview";
import DocumentTypes from "./components/DocumentTypes";
import DocumentFeatures from "./components/DocumentFeatures";

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full px-4 sm:px-6 lg:px-8 py-8">
        <DocumentsOverview />
        <DocumentTypes />
        <DocumentFeatures />
      </div>
    </div>
  );
}
