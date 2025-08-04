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
  ChevronDownIcon,
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

type AppKey = (typeof APPS)[number]["key"];

// Mapping app.key to icon and label
const appIconMap: Record<
  AppKey,
  { icon: React.ComponentType<any>; label: string }
> = {
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
              <div className="absolute inset-0 bg-white/95 flex z-40">
                <div className="flex w-full max-w-5xl mx-auto my-8 overflow-hidden rounded-2xl shadow-lg">
                  {/* Left nav */}
                  <nav className="w-48 bg-gray-50 border-r">
                    <div className="px-4 py-6 font-medium text-gray-800">
                      Zoho Apps
                    </div>
                    <ul className="space-y-2 px-2">
                      {APPS.slice(1).map((a) => (
                        <li key={a.key}>
                          <button
                            onClick={() => setActiveApp(a.key)}
                            className={clsx(
                              "flex items-center gap-2 w-full px-4 py-2 rounded-lg",
                              activeApp === a.key
                                ? "bg-white text-blue-600 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            )}
                          >
                            {React.createElement(appIconMap[a.key].icon, {
                              className: `w-5 h-5 ${
                                activeApp === a.key
                                  ? "text-blue-600"
                                  : "text-gray-500"
                              }`,
                            })}
                            {appIconMap[a.key].label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>

                  {/* Right content */}
                  <div className="flex-1 p-6 bg-white space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {APPS.slice(1).map((a) => (
                        <div
                          key={a.key}
                          className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            {React.createElement(appIconMap[a.key].icon, {
                              className: "w-8 h-8 text-blue-600",
                            })}
                            <div>
                              <div className="font-medium text-gray-800">
                                {appIconMap[a.key].label}
                              </div>
                              {a.key === "cliq" && (
                                <div className="text-sm text-gray-500">
                                  Email & Collaboration
                                </div>
                              )}
                              {a.key === "books" && (
                                <div className="text-sm text-gray-500">
                                  Finance
                                </div>
                              )}
                              {a.key === "creator" && (
                                <div className="text-sm text-gray-500">
                                  Custom Solutions
                                </div>
                              )}
                              {a.key === "contacts" && (
                                <div className="text-sm text-gray-500">
                                  CRM & Contacts
                                </div>
                              )}
                              {a.key === "help" && (
                                <div className="text-sm text-gray-500">
                                  Help Documentation
                                </div>
                              )}
                            </div>
                          </div>

                          <label className="relative inline-block w-12 h-6">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="peer opacity-0 w-0 h-0"
                            />
                            <span className="absolute inset-0 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition" />
                            <span className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full peer-checked:translate-x-6 transition" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filter panel */}
            {showFilter && (
              <div className="absolute inset-0 bg-white/95 flex items-center justify-center z-30">
                <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      1 Filter Applied
                    </h3>
                    <button 
                      onClick={() => {
                        setAppFilters(["All Applications"]);
                        setPageTypes(["All Categories"]);
                      }}
                      className="text-red-600 hover:underline"
                    >
                      Reset Filters
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <button
                      onClick={() => setShowMulti("applications")}
                      className="w-full flex justify-between text-gray-800 items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <span>Applications</span>
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    </button>

                    <button
                      onClick={() => setShowMulti("pageType")}
                      className="w-full flex justify-between text-gray-800 items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <span>Page Type</span>
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowFilter(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowFilter(false)}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>

                  {/* MultiSelect overlays */}
                  {showMulti === "applications" && (
                    <div className="absolute top-24 left-6">
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
                    </div>
                  )}
                  {showMulti === "pageType" && (
                    <div className="absolute top-24 right-6">
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
                    </div>
                  )}
                </div>
              </div>
            )}

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
        </div>
      </div>
    </div>
  );
}
