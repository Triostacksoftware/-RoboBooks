"use client";

import React, { useState, useEffect, useRef } from "react";
import { XMarkIcon, FunnelIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  Squares2X2Icon,
  UserIcon,
  ChatBubbleLeftEllipsisIcon,
  BanknotesIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

// left‐nav apps
const APPS = [
  { key: "all", label: "All Apps" },
  { key: "contacts", label: "Contacts" },
  { key: "cliq", label: "Cliq" },
  { key: "books", label: "Books" },
  { key: "creator", label: "Creator" },
  { key: "help", label: "Help Pages" },
] as const;

type AppKey = typeof APPS[number]["key"];

// Mapping app.key to icon and label
const appIconMap: Record<AppKey, { icon: React.ComponentType<any>; label: string }> = {
  all: { icon: Squares2X2Icon, label: "All Apps" },
  contacts: { icon: UserIcon, label: "Contacts" },
  cliq: { icon: ChatBubbleLeftEllipsisIcon, label: "Cliq" },
  books: { icon: BanknotesIcon, label: "Books" },
  creator: { icon: PencilSquareIcon, label: "Creator" },
  help: { icon: QuestionMarkCircleIcon, label: "Help Pages" },
};

// helper multi‐select (search + checkboxes)
function MultiSelect({
  label,
  options,
  selected,
  onDone,
  onCancel,
}: {
  label: string;
  options: string[];
  selected: string[];
  onDone: (sel: string[]) => void;
  onCancel: () => void;
}) {
  const [local, setLocal] = useState<string[]>(selected);
  const [q, setQ] = useState("");
  const filtered = options.filter((o) =>
    o.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-80">
      <h3 className="font-medium mb-2">{label}</h3>
      <input
        className="w-full mb-3 px-3 py-2 border rounded-lg"
        placeholder="Search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="max-h-48 overflow-auto mb-3">
        {filtered.map((opt) => (
          <label key={opt} className="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              checked={local.includes(opt)}
              onChange={() => {
                setLocal((l) =>
                  l.includes(opt) ? l.filter((x) => x !== opt) : [...l, opt]
                );
              }}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-end space-x-2">
        <button onClick={onCancel} className="px-3 py-1 rounded-lg border">
          Cancel
        </button>
        <button
          onClick={() => onDone(local)}
          className="px-3 py-1 rounded-lg bg-blue-600 text-white"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default function ZiaSearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeApp, setActiveApp] = useState<AppKey>("all");
  const [searchQ, setSearchQ] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMulti, setShowMulti] = useState<
    null | "applications" | "pageType"
  >(null);

  // dummy options
  const appFilterOpts = ["All Applications", "Books", "Expense", "Billing"];
  const pageTypeOpts = [
    "All Categories",
    "Resources",
    "Knowledge Base",
    "Help Videos",
  ];
  const [appFilters, setAppFilters] = useState<string[]>(["All Applications"]);
  const [pageTypes, setPageTypes] = useState<string[]>(["All Categories"]);

  // ref for overlay container
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (isOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex">
      <div
        ref={ref}
        className="bg-white rounded-2xl flex flex-1 max-w-6xl mx-auto my-8 overflow-hidden"
      >
        {/* Sidebar */}
        <nav className="w-20 bg-gray-900 text-white flex flex-col items-center py-2 pt-6 space-y-2 rounded-tl-2xl rounded-bl-2xl min-h-[80vh]">
          {APPS.map((app) => {
            const Icon = appIconMap[app.key].icon;
            const isActive = app.key === activeApp && !showSettings;
            return (
              <button
                key={app.key}
                onClick={() => {
                  setActiveApp(app.key);
                  setShowSettings(false);
                }}
                className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg transition
          ${
            isActive
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-800 text-gray-300"
          }`}
              >
                <Icon className="w-7 h-7 mb-1" />
                <span className="text-xs font-medium">
                  {appIconMap[app.key].label}
                </span>
              </button>
            );
          })}

          <div className="border-t border-gray-700 w-4/5 my-2" />

          <button
            onClick={() => setShowSettings((s) => !s)}
            className="w-16 h-16 flex flex-col items-center justify-center hover:bg-gray-800 rounded-lg text-gray-300 mt-auto mb-3"
          >
            <Cog6ToothIcon className="w-7 h-7 mb-1" />
            <span className="text-xs font-medium">Settings</span>
          </button>
        </nav>

        {/* Main Content */}
        <div className="flex-1 relative">
          {/* Header */}
          <div className="flex items-center px-4 py-3 border-b">
            <input
              className="flex-1 bg-gray-100 px-4 py-2 rounded-lg placeholder-gray-500"
              placeholder="Search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
            <button
              onClick={() => setShowFilter(true)}
              className="ml-3 p-2 hover:bg-gray-200 rounded-lg"
            >
              <FunnelIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="ml-2 p-2 hover:bg-gray-200 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 h-[70vh] overflow-auto">
            {/* Initial help screen */}
            {activeApp === "all" && !showSettings && !showFilter && (
              <div className="space-y-8 text-center text-gray-700">
                <h2 className="text-2xl font-semibold">Zia Search</h2>
                <p>Search, Refine, Review and Act – All in one place</p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h3 className="font-medium text-lg">
                      Search by Application
                    </h3>
                    <p className="text-sm">
                      Limit search to a specific app. e.g. <code>#mail</code> or{" "}
                      <code>#cliq</code>
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Search by Contact</h3>
                    <p className="text-sm">
                      Interested only in results related to a particular
                      contact? Try <code>@john</code>
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">
                      Fine-Grained Filters
                    </h3>
                    <p className="text-sm">
                      Too many results? Use filters to narrow down the results.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Quick Actions</h3>
                    <p className="text-sm">
                      Reply to a mail, start a conversation, edit a record and
                      more…
                    </p>
                  </div>
                </div>
                <button className="mt-8 px-6 py-3 bg-gray-200 rounded-lg flex items-center mx-auto">
                  <img
                    src="https://www.google.com/chrome/static/images/chrome-logo.svg"
                    alt="Chrome"
                    className="w-5 h-5 mr-2"
                  />
                  Zia Search Chrome Extension
                </button>
                <div className="mt-4">
                  <a
                    href="https://search.zoho.in"
                    target="_blank"
                    className="text-blue-600"
                  >
                    Go to search.zoho.in
                  </a>
                </div>
              </div>
            )}

            {/* Search results placeholder */}
            {activeApp !== "all" && !showSettings && !showFilter && (
              <div className="text-gray-500">
                {/* you’d hook real results here */}
                <p>
                  No results yet for <strong>{activeApp}</strong>
                </p>
              </div>
            )}

            {/* Settings panel */}
            {showSettings && (
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Settings</h3>
                <ul className="space-y-4">
                  {APPS.slice(1).map((a) => (
                    <li key={a.key} className="flex justify-between">
                      <span>{a.label}</span>
                      <input type="checkbox" defaultChecked />
                    </li>
                  ))}
                </ul>
                {activeApp !== "all" && activeApp !== "help" && (
                  // per-app extra settings
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">
                      {APPS.find((a) => a.key === activeApp)!.label} Settings
                    </h4>
                    <fieldset className="space-y-2">
                      <legend className="text-sm font-medium">
                        Sort results by
                      </legend>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="sort" defaultChecked />
                        <span>Relevance</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="sort" />
                        <span>Modified Time</span>
                      </label>
                    </fieldset>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filter panel */}
          {showFilter && (
            <div className="absolute inset-0 bg-white/95 p-6 flex items-start justify-center">
              <div>
                <div className="flex justify-between mb-4">
                  <h3 className="font-medium text-lg">1 Filter Applied</h3>
                  <button
                    onClick={() => {
                      setAppFilters(["All Applications"]);
                      setPageTypes(["All Categories"]);
                    }}
                    className="text-red-600"
                  >
                    Reset Filters
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button
                    onClick={() => setShowMulti("applications")}
                    className="px-4 py-2 border rounded-lg text-left"
                  >
                    Applications: {appFilters.join(", ")}
                  </button>
                  <button
                    onClick={() => setShowMulti("pageType")}
                    className="px-4 py-2 border rounded-lg text-left"
                  >
                    Page Type: {pageTypes.join(", ")}
                  </button>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowFilter(false)}
                    className="px-4 py-2 rounded-lg border"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* MultiSelect overlays */}
              {showMulti === "applications" && (
                <MultiSelect
                  label="Applications"
                  options={appFilterOpts}
                  selected={appFilters}
                  onDone={(sel) => {
                    setAppFilters(sel);
                    setShowMulti(null);
                  }}
                  onCancel={() => setShowMulti(null)}
                />
              )}
              {showMulti === "pageType" && (
                <MultiSelect
                  label="Page Type"
                  options={pageTypeOpts}
                  selected={pageTypes}
                  onDone={(sel) => {
                    setPageTypes(sel);
                    setShowMulti(null);
                  }}
                  onCancel={() => setShowMulti(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
