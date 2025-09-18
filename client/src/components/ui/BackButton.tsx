"use client";

import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface BackButtonProps {
  href: string;
  label: string;
}

export default function BackButton({ href, label }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
    >
      <ArrowLeftIcon className="h-4 w-4 mr-2" />
      {label}
    </Link>
  );
}
