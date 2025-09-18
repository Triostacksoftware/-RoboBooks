// components/RightSidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  QuestionMarkCircleIcon,
  MegaphoneIcon,
  PlayCircleIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperClipIcon,
  Bars3Icon,
  UserIcon,
  InboxIcon,
  BellIcon,
  ListBulletIcon,
  ClipboardDocumentCheckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

// Custom ReadAllIcon component
const ReadAllIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 28 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* First checkmark */}
    <path d="M3 8l5 5 9-9" />
    {/* Second checkmark - more spaced */}
    <path d="M9 12l5 5 9-9" />
  </svg>
);

const ICON_BUTTONS = [
  {
    Icon: QuestionMarkCircleIcon,
    label: "Instant Helper",
    badge: null,
    action: "help",
  },
  {
    Icon: MegaphoneIcon,
    label: "Read more",
    badge: "1",
    action: "announcements",
  },
  { Icon: PlayCircleIcon, label: "Webinars", badge: null, action: "webinars" },
  {
    Icon: DocumentTextIcon,
    label: "Robo Notebook",
    badge: null,
    action: "robo-notebook",
  },
  {
    Icon: Cog6ToothIcon,
    label: "All Extensions",
    badge: null,
    action: "extensions",
  },
  {
    Icon: WrenchScrewdriverIcon,
    label: "Configure Features",
    badge: null,
    action: "configure-features",
  },
];

const FAQ_ITEMS = [
  "How do I import invoices?",
  "How do I display my vendor/customer's PAN in their transaction?",
  "Can I pull multiple expenses into an invoice?",
  "How do I add bank details to my invoices?",
  "I want to provide discounts at invoice level. Can I?",
  "How do I receive payments online?",
  "How to set up recurring invoices?",
  "How to manage customer credits?",
  "How to generate tax reports?",
  "How to integrate with payment gateways?",
];

const DOCUMENT_ITEMS = [
  "Introduction - Invoices",
  "Record Payment for Invoice",
  "Payments Received",
  "Creating Recurring Invoices",
  "Managing Customer Credits",
  "Tax Configuration Guide",
  "Payment Gateway Setup",
  "Advanced Reporting",
];

// Feature configuration data
const FEATURE_CONFIG = [
  {
    id: "quotes",
    name: "Quotes",
    description: "Send new proposals and get them approved from your customer.",
    enabled: true,
  },
  {
    id: "retainer-invoices",
    name: "Retainer Invoices",
    description: "Collect advance payments or retainers from your customers.",
    enabled: false,
  },
  {
    id: "timesheet",
    name: "Timesheet",
    description: "Track time for projects and bill them to your customers.",
    enabled: true,
  },
  {
    id: "price-list",
    name: "Price List",
    description:
      "Customize price lists for your customers, for the items you sell.",
    enabled: false,
  },
  {
    id: "sales-orders",
    name: "Sales Orders",
    description: "Confirm your customer's order and ship goods soon.",
    enabled: true,
  },
  {
    id: "delivery-challans",
    name: "Delivery Challans",
    description: "Manage transfer of goods effectively.",
    enabled: true,
  },
  {
    id: "purchase-orders",
    name: "Purchase Orders",
    description: "Create and send orders to purchase goods.",
    enabled: true,
  },
  {
    id: "inventory",
    name: "I would like to enable Inventory.",
    description: "Manage your stock levels effectively.",
    enabled: false,
  },
];

export default function RightSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [webinarsOpen, setWebinarsOpen] = useState(false);
  const [roboNotebookOpen, setRoboNotebookOpen] = useState(false);
  const [extensionsOpen, setExtensionsOpen] = useState(false);
  const [configureFeaturesOpen, setConfigureFeaturesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isAnnouncementsPinned, setIsAnnouncementsPinned] = useState(false);
  const [isWebinarsPinned, setIsWebinarsPinned] = useState(false);
  const [isRoboNotebookPinned, setIsRoboNotebookPinned] = useState(false);
  const [isExtensionsPinned, setIsExtensionsPinned] = useState(false);
  const [isConfigureFeaturesPinned, setIsConfigureFeaturesPinned] =
    useState(false);
  const [showAllFAQ, setShowAllFAQ] = useState(false);
  const [showAllDocuments, setShowAllDocuments] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState("Invoices");
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<
    number | null
  >(null);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(1);
  const [featureConfig, setFeatureConfig] = useState(FEATURE_CONFIG);

  // 1) Sync a body–level class so your main content can react in global CSS:
  useEffect(() => {
    // Check if we're on the client side
    if (typeof document !== "undefined") {
      document.body.classList.toggle("rs-collapsed", collapsed);
      document.body.classList.toggle("rs-expanded", !collapsed);
      return () => {
        document.body.classList.remove("rs-collapsed", "rs-expanded");
      };
    }
  }, [collapsed]);

  // Handle click outside to close (only if not pinned)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (helpPanelOpen && !isPinned) {
        if (!target.closest("[data-help-panel]")) {
          setHelpPanelOpen(false);
        }
      }
      if (announcementsOpen && !isAnnouncementsPinned) {
        if (!target.closest("[data-announcements-panel]")) {
          setAnnouncementsOpen(false);
        }
      }
      if (webinarsOpen && !isWebinarsPinned) {
        if (!target.closest("[data-webinars-panel]")) {
          setWebinarsOpen(false);
        }
      }
      if (roboNotebookOpen && !isRoboNotebookPinned) {
        if (!target.closest("[data-robo-notebook-panel]")) {
          setRoboNotebookOpen(false);
        }
      }
      if (extensionsOpen && !isExtensionsPinned) {
        if (!target.closest("[data-extensions-panel]")) {
          setExtensionsOpen(false);
        }
      }
      if (configureFeaturesOpen && !isConfigureFeaturesPinned) {
        if (!target.closest("[data-configure-features-panel]")) {
          setConfigureFeaturesOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    helpPanelOpen,
    isPinned,
    announcementsOpen,
    isAnnouncementsPinned,
    webinarsOpen,
    isWebinarsPinned,
    roboNotebookOpen,
    isRoboNotebookPinned,
    extensionsOpen,
    isExtensionsPinned,
    configureFeaturesOpen,
    isConfigureFeaturesPinned,
  ]);

  // 2) Choose the correct arrow
  const ToggleIcon = collapsed ? ChevronLeftIcon : ChevronRightIcon;
  const ariaLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  if (collapsed) {
    // Collapsed view: single "expand" button at the bottom
    const handleIconClick = (action: string | null) => {
      if (action === "help") {
        setHelpPanelOpen(true);
      } else if (action === "announcements") {
        setAnnouncementsOpen(true);
      } else if (action === "webinars") {
        setWebinarsOpen(true);
      } else if (action === "robo-notebook") {
        setRoboNotebookOpen(true);
      } else if (action === "extensions") {
        setExtensionsOpen(true);
      } else if (action === "configure-features") {
        setConfigureFeaturesOpen(true);
      }
    };

    const handleContactUs = () => {
      // Redirect to contact page or open contact modal
      window.open("/contact", "_blank");
    };

    const handlePinToggle = () => {
      setIsPinned(!isPinned);
      // If pinning, keep the panel open
      if (!isPinned) {
        setHelpPanelOpen(true);
      }
    };

    const handleAnnouncementsPinToggle = () => {
      setIsAnnouncementsPinned(!isAnnouncementsPinned);
      // If pinning, keep the panel open
      if (!isAnnouncementsPinned) {
        setAnnouncementsOpen(true);
      }
    };

    const handleWebinarsPinToggle = () => {
      setIsWebinarsPinned(!isWebinarsPinned);
      // If pinning, keep the panel open
      if (!isWebinarsPinned) {
        setWebinarsOpen(true);
      }
    };

    const handleRoboNotebookPinToggle = () => {
      setIsRoboNotebookPinned(!isRoboNotebookPinned);
      // If pinning, keep the panel open
      if (!isRoboNotebookPinned) {
        setRoboNotebookOpen(true);
      }
    };

    const handleExtensionsPinToggle = () => {
      setIsExtensionsPinned(!isExtensionsPinned);
      // If pinning, keep the panel open
      if (!isExtensionsPinned) {
        setExtensionsOpen(true);
      }
    };

    const handleConfigureFeaturesPinToggle = () => {
      setIsConfigureFeaturesPinned(!isConfigureFeaturesPinned);
      // If pinning, keep the panel open
      if (!isConfigureFeaturesPinned) {
        setConfigureFeaturesOpen(true);
      }
    };

    const handleClosePanel = () => {
      // Only close if not pinned
      if (!isPinned) {
        setHelpPanelOpen(false);
      }
    };

    const handleCloseAnnouncements = () => {
      // Only close if not pinned
      if (!isAnnouncementsPinned) {
        setAnnouncementsOpen(false);
      }
    };

    const handleCloseWebinars = () => {
      // Only close if not pinned
      if (!isWebinarsPinned) {
        setWebinarsOpen(false);
      }
    };

    const handleCloseRoboNotebook = () => {
      // Only close if not pinned
      if (!isRoboNotebookPinned) {
        setRoboNotebookOpen(false);
      }
    };

    const handleCloseExtensions = () => {
      // Only close if not pinned
      if (!isExtensionsPinned) {
        setExtensionsOpen(false);
      }
    };

    const handleCloseConfigureFeatures = () => {
      // Only close if not pinned
      if (!isConfigureFeaturesPinned) {
        setConfigureFeaturesOpen(false);
      }
    };

    const handleFeatureToggle = (featureId: string) => {
      setFeatureConfig((prev) =>
        prev.map((feature) =>
          feature.id === featureId
            ? { ...feature, enabled: !feature.enabled }
            : feature
        )
      );
    };

    const handleSaveFeatures = () => {
      // Here you would typically save to backend/localStorage
      console.log("Saving feature configuration:", featureConfig);
      // Show success message (you can use your toast system here)
      setConfigureFeaturesOpen(false);
    };

    const handleCancelFeatures = () => {
      // Reset to original configuration
      setFeatureConfig(FEATURE_CONFIG);
      setConfigureFeaturesOpen(false);
    };

    const handleModuleSelect = (module: string) => {
      setSelectedModule(module);
      setModulesOpen(false);
    };

    const handleShowAllAnnouncements = () => {
      // Toggle read/unread status
      if (unreadAnnouncements > 0) {
        setUnreadAnnouncements(0);
      } else {
        setUnreadAnnouncements(1);
      }
      // Don't change the view - keep showing single announcement
    };

    // Dynamic content based on selected module
    const getModuleContent = (module: string) => {
      const content = {
        Invoices: {
          title: "Invoices",
          video: {
            title: "Learn how to create your first invoice",
            duration: "3:09",
          },
          faq: [
            "How do I import invoices?",
            "How do I display my vendor/customer's PAN in their transaction?",
            "Can I pull multiple expenses into an invoice?",
            "How do I add bank details to my invoices?",
            "I want to provide discounts at invoice level. Can I?",
          ],
        },
        Items: {
          title: "Items",
          video: {
            title: "Learn how to create and manage items",
            duration: "2:45",
          },
          faq: [
            "How do I add new items?",
            "How to categorize items?",
            "Can I import items from Excel?",
            "How to set item prices?",
            "How to manage item inventory?",
          ],
        },
        Banking: {
          title: "Banking",
          video: {
            title: "Learn how to connect your bank account",
            duration: "4:12",
          },
          faq: [
            "How to connect bank accounts?",
            "How to reconcile transactions?",
            "Can I import bank statements?",
            "How to set up automatic categorization?",
            "How to handle bank fees?",
          ],
        },
        Contacts: {
          title: "Contacts",
          video: {
            title: "Learn how to manage your contacts",
            duration: "3:30",
          },
          faq: [
            "How to add new contacts?",
            "How to import contacts?",
            "Can I categorize contacts?",
            "How to manage contact groups?",
            "How to sync contacts?",
          ],
        },
        Quotes: {
          title: "Quotes",
          video: {
            title: "Learn how to create professional quotes",
            duration: "3:55",
          },
          faq: [
            "How to create a new quote?",
            "How to convert quote to invoice?",
            "Can I set quote expiry dates?",
            "How to track quote status?",
            "How to customize quote templates?",
          ],
        },
        "Sales Orders": {
          title: "Sales Orders",
          video: {
            title: "Learn how to manage sales orders",
            duration: "4:20",
          },
          faq: [
            "How to create sales orders?",
            "How to track order fulfillment?",
            "Can I set delivery dates?",
            "How to manage order status?",
            "How to handle order cancellations?",
          ],
        },
        "Customer Payment": {
          title: "Customer Payment",
          video: {
            title: "Learn how to record customer payments",
            duration: "3:15",
          },
          faq: [
            "How to record customer payments?",
            "How to apply payments to invoices?",
            "Can I set up recurring payments?",
            "How to handle partial payments?",
            "How to manage payment methods?",
          ],
        },
        Expenses: {
          title: "Expenses",
          video: {
            title: "Learn how to track and manage expenses",
            duration: "3:40",
          },
          faq: [
            "How to add new expenses?",
            "How to categorize expenses?",
            "Can I import expense receipts?",
            "How to set up expense approval?",
            "How to track expense reports?",
          ],
        },
        "Purchase Orders": {
          title: "Purchase Orders",
          video: {
            title: "Learn how to create purchase orders",
            duration: "4:05",
          },
          faq: [
            "How to create purchase orders?",
            "How to track PO status?",
            "Can I set delivery schedules?",
            "How to manage vendor relationships?",
            "How to handle PO approvals?",
          ],
        },
        Bills: {
          title: "Bills",
          video: {
            title: "Learn how to manage vendor bills",
            duration: "3:25",
          },
          faq: [
            "How to create vendor bills?",
            "How to track bill payments?",
            "Can I set up recurring bills?",
            "How to handle bill approvals?",
            "How to manage vendor credits?",
          ],
        },
        "Vendor Payments": {
          title: "Vendor Payments",
          video: {
            title: "Learn how to process vendor payments",
            duration: "3:50",
          },
          faq: [
            "How to process vendor payments?",
            "How to set up payment schedules?",
            "Can I batch process payments?",
            "How to track payment history?",
            "How to handle payment disputes?",
          ],
        },
        Timesheets: {
          title: "Timesheets",
          video: {
            title: "Learn how to manage employee timesheets",
            duration: "3:35",
          },
          faq: [
            "How to create timesheets?",
            "How to track employee hours?",
            "Can I import time data?",
            "How to approve timesheets?",
            "How to calculate overtime?",
          ],
        },
        "e-Way Bills": {
          title: "e-Way Bills",
          video: {
            title: "Learn how to generate e-Way bills",
            duration: "4:15",
          },
          faq: [
            "How to generate e-Way bills?",
            "How to track e-Way bill status?",
            "Can I bulk generate e-Way bills?",
            "How to handle e-Way bill updates?",
            "How to manage e-Way bill validity?",
          ],
        },
        "GST Filing": {
          title: "GST Filing",
          video: {
            title: "Learn how to file GST returns",
            duration: "5:20",
          },
          faq: [
            "How to file GST returns?",
            "How to calculate GST liability?",
            "Can I generate GST reports?",
            "How to handle GST credits?",
            "How to manage GST compliance?",
          ],
        },
        Accountant: {
          title: "Accountant",
          video: {
            title: "Learn how to collaborate with your accountant",
            duration: "3:10",
          },
          faq: [
            "How to invite your accountant?",
            "How to share financial data?",
            "Can I set access permissions?",
            "How to track accountant activities?",
            "How to manage accountant access?",
          ],
        },
        Reports: {
          title: "Reports",
          video: {
            title: "Learn how to generate and analyze reports",
            duration: "4:30",
          },
          faq: [
            "How to generate financial reports?",
            "How to customize report templates?",
            "Can I schedule automatic reports?",
            "How to export report data?",
            "How to create custom dashboards?",
          ],
        },
      };

      return content[module as keyof typeof content] || content["Invoices"];
    };

    const MODULES = [
      "Items",
      "Banking",
      "Contacts",
      "Quotes",
      "Sales Orders",
      "Invoices",
      "Customer Payment",
      "Expenses",
      "Purchase Orders",
      "Bills",
      "Vendor Payments",
      "Timesheets",
      "e-Way Bills",
      "GST Filing",
      "Accountant",
      "Reports",
    ];

    // Help Panel
    if (helpPanelOpen) {
      const currentModuleContent = getModuleContent(selectedModule);

      return (
        <>
          {/* Always show the sidebar */}
          <aside
            data-settings-utils
            className="fixed top-14 right-0 bottom-0 flex flex-col items-center bg-white shadow-lg px-4 py-4 select-none z-40 w-20"
          >
            {/* icon stack, pushed down via pt-6 */}
            <div className="flex-1 w-full overflow-y-auto space-y-4 pt-2 pb-4">
              {ICON_BUTTONS.map(({ Icon, label, badge, action }) => (
                <div key={label} className="relative group">
                  <button
                    aria-label={label}
                    onClick={() => handleIconClick(action)}
                    className="w-10 h-10 mx-auto flex items-center justify-center bg-blue-100 rounded-full shadow hover:shadow-lg transition relative"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    {/* Notification Badge */}
                    {action === "announcements"
                      ? unreadAnnouncements > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {unreadAnnouncements}
                          </div>
                        )
                      : badge && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {badge}
                          </div>
                        )}
                  </button>
                  {/* Tooltip */}
                  <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      {label}
                      {/* Tooltip arrow pointing right */}
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Single collapse toggle at the bottom */}
            <button
              onClick={() => setCollapsed(true)}
              aria-label={ariaLabel}
              className="mt-auto p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ToggleIcon className="w-5 h-5 text-gray-600" />
            </button>
          </aside>

          {/* Help Panel */}
          <aside
            data-help-panel
            className="fixed top-14 right-20 bottom-0 w-96 bg-white shadow-lg z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {/* Pin Option */}
                <button
                  onClick={handlePinToggle}
                  className={`p-1 rounded transition ${
                    isPinned
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title={isPinned ? "Unpin panel" : "Pin panel"}
                >
                  <PaperClipIcon
                    className={`w-4 h-4 ${isPinned ? "rotate-45" : ""}`}
                  />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                  Instant Helper
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Help Res..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48 pl-8 pr-8 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {/* Red X button on right of search container */}
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleClosePanel}
                  className={`p-1 rounded-full hover:bg-gray-100 transition ${
                    isPinned ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isPinned}
                  title={
                    isPinned
                      ? "Panel is pinned - unpin to close"
                      : "Close panel"
                  }
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Invoices Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <button
                    onClick={() => setModulesOpen(!modulesOpen)}
                    className="p-1 rounded hover:bg-gray-100 transition"
                  >
                    <Bars3Icon className="w-5 h-5 text-black" />
                  </button>
                  <h3 className="font-bold text-black text-lg">
                    {currentModuleContent.title}
                  </h3>
                </div>

                {/* Modules Dropdown */}
                {modulesOpen && (
                  <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between p-3 border-b border-gray-200">
                      <h4 className="font-semibold text-gray-800">Modules</h4>
                      <button
                        onClick={() => setModulesOpen(false)}
                        className="p-1 rounded hover:bg-gray-100 transition"
                      >
                        <XMarkIcon className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="py-2">
                      {MODULES.map((module, index) => (
                        <div
                          key={index}
                          className={`px-3 py-2 cursor-pointer transition ${
                            module === selectedModule
                              ? "bg-blue-600 text-white"
                              : "hover:bg-gray-50 text-gray-800"
                          }`}
                          onClick={() => handleModuleSelect(module)}
                        >
                          {module}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Feature */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <PlayCircleIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">
                    Video Tutorial
                  </h3>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PlayCircleIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {currentModuleContent.video.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentModuleContent.video.duration}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-2">
                  {currentModuleContent.faq
                    .slice(0, showAllFAQ ? currentModuleContent.faq.length : 5)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                      >
                        <span className="text-sm text-gray-600">{item}</span>
                        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => setShowAllFAQ(!showAllFAQ)}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>{showAllFAQ ? "See less" : "Show more"}</span>
                  {showAllFAQ ? (
                    <ChevronUpIcon className="w-4 h-4" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Documents Section */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">
                  Help Documents
                </h3>
                <div className="space-y-2">
                  {DOCUMENT_ITEMS.slice(
                    0,
                    showAllDocuments ? DOCUMENT_ITEMS.length : 3
                  ).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-blue-600">{item}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowAllDocuments(!showAllDocuments)}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showAllDocuments ? "Show less" : "Show all"}
                </button>
              </div>

              {/* Need Assistance Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">
                      Need Assistance?
                    </span>
                  </div>
                  <button
                    onClick={handleContactUs}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </>
      );
    }

    // Announcements Panel
    if (announcementsOpen) {
      return (
        <>
          {/* Always show the sidebar */}
          <aside
            data-settings-utils
            className="fixed top-14 right-0 bottom-0 flex flex-col items-center bg-white shadow-lg px-4 py-4 select-none z-40 w-20"
          >
            {/* icon stack, pushed down via pt-6 */}
            <div className="flex-1 w-full overflow-y-auto space-y-4 pt-2 pb-4">
              {ICON_BUTTONS.map(({ Icon, label, badge, action }) => (
                <div key={label} className="relative group">
                  <button
                    aria-label={label}
                    onClick={() => handleIconClick(action)}
                    className="w-10 h-10 mx-auto flex items-center justify-center bg-blue-100 rounded-full shadow hover:shadow-lg transition relative"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    {/* Notification Badge */}
                    {action === "announcements"
                      ? unreadAnnouncements > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {unreadAnnouncements}
                          </div>
                        )
                      : badge && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {badge}
                          </div>
                        )}
                  </button>
                  {/* Tooltip */}
                  <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      {label}
                      {/* Tooltip arrow pointing right */}
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Single collapse toggle at the bottom */}
            <button
              onClick={() => setCollapsed(true)}
              aria-label={ariaLabel}
              className="mt-auto p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ToggleIcon className="w-5 h-5 text-gray-600" />
            </button>
          </aside>

          {/* Announcements Panel */}
          <aside
            data-announcements-panel
            className="fixed top-14 right-20 bottom-0 w-96 bg-white shadow-lg z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {/* Pin Option */}
                <button
                  onClick={handleAnnouncementsPinToggle}
                  className={`p-1 rounded transition ${
                    isAnnouncementsPinned
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title={isAnnouncementsPinned ? "Unpin panel" : "Pin panel"}
                >
                  <PaperClipIcon
                    className={`w-4 h-4 ${
                      isAnnouncementsPinned ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                  Announcements
                </h2>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShowAllAnnouncements}
                  className="text-gray-800 hover:text-gray-900 text-sm font-medium"
                >
                  <ReadAllIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCloseAnnouncements}
                  className={`p-1 rounded-full hover:bg-gray-100 transition ${
                    isAnnouncementsPinned ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isAnnouncementsPinned}
                  title={
                    isAnnouncementsPinned
                      ? "Panel is pinned - unpin to close"
                      : "Close panel"
                  }
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Show single announcement only */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 group">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MegaphoneIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Your referrals matter — even more now.
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {expandedAnnouncement === 1 ? (
                        <>
                          Love using Zoho Books? Refer and earn 20% as referral
                          credits on every customer you refer this month. Your
                          contact also receives ?100 in wallet credits. There is
                          no limit to how much you can earn—start referring
                          today!
                          <button
                            onClick={() => setExpandedAnnouncement(null)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium ml-1"
                          >
                            Show Less
                          </button>
                        </>
                      ) : (
                        <>
                          Love using Zoho Books? Refer and earn 20% as referral
                          credits on every customer you refer...
                          <button
                            onClick={() => setExpandedAnnouncement(1)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1"
                          >
                            Show More
                          </button>
                        </>
                      )}
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                      Refer Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </>
      );
    }

    // Webinars Panel
    if (webinarsOpen) {
      return (
        <>
          {/* Always show the sidebar */}
          <aside
            data-settings-utils
            className="fixed top-14 right-0 bottom-0 flex flex-col items-center bg-white shadow-lg px-4 py-4 select-none z-40 w-20"
          >
            {/* icon stack, pushed down via pt-6 */}
            <div className="flex-1 w-full overflow-y-auto space-y-4 pt-2 pb-4">
              {ICON_BUTTONS.map(({ Icon, label, badge, action }) => (
                <div key={label} className="relative group">
                  <button
                    aria-label={label}
                    onClick={() => handleIconClick(action)}
                    className="w-10 h-10 mx-auto flex items-center justify-center bg-blue-100 rounded-full shadow hover:shadow-lg transition relative"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    {/* Notification Badge */}
                    {action === "announcements"
                      ? unreadAnnouncements > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {unreadAnnouncements}
                          </div>
                        )
                      : badge && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {badge}
                          </div>
                        )}
                  </button>
                  {/* Tooltip */}
                  <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      {label}
                      {/* Tooltip arrow pointing right */}
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Single collapse toggle at the bottom */}
            <button
              onClick={() => setCollapsed(true)}
              aria-label={ariaLabel}
              className="mt-auto p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ToggleIcon className="w-5 h-5 text-gray-600" />
            </button>
          </aside>

          {/* Webinars Panel */}
          <aside
            data-webinars-panel
            className="fixed top-14 right-20 bottom-0 w-96 bg-white shadow-lg z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {/* Pin Option */}
                <button
                  onClick={handleWebinarsPinToggle}
                  className={`p-1 rounded transition ${
                    isWebinarsPinned
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title={isWebinarsPinned ? "Unpin panel" : "Pin panel"}
                >
                  <PaperClipIcon
                    className={`w-4 h-4 ${isWebinarsPinned ? "rotate-45" : ""}`}
                  />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                  Webinars
                </h2>
              </div>
              <button
                onClick={handleCloseWebinars}
                className={`p-1 rounded-full hover:bg-gray-100 transition ${
                  isWebinarsPinned ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isWebinarsPinned}
                title={
                  isWebinarsPinned
                    ? "Panel is pinned - unpin to close"
                    : "Close panel"
                }
              >
                <XMarkIcon className="w-5 h-5 text-red-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
              {/* Illustration */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {/* Laptop */}
                  <div className="w-32 h-20 bg-white border-2 border-gray-300 rounded-lg relative">
                    {/* Screen */}
                    <div className="w-24 h-14 bg-gray-200 rounded-md mx-auto mt-2 relative">
                      {/* User silhouette */}
                      <div className="w-8 h-8 bg-gray-400 rounded-full mx-auto mt-3"></div>
                    </div>
                  </div>
                  {/* Speech bubble */}
                  <div className="absolute -top-8 -right-4 w-16 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <div className="space-y-1">
                      <div className="w-8 h-0.5 bg-white rounded"></div>
                      <div className="w-6 h-0.5 bg-white rounded"></div>
                      <div className="w-4 h-0.5 bg-white rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <p className="text-gray-600 text-center max-w-xs">
                There are no webinars from Zoho Books at the moment. Check this
                space regularly to stay updated on the webinars conducted by
                Zoho Books.
              </p>
            </div>
          </aside>
        </>
      );
    }

    // Robo Notebook Panel
    if (roboNotebookOpen) {
      return (
        <>
          {/* Always show the sidebar */}
          <aside
            data-settings-utils
            className="fixed top-14 right-0 bottom-0 flex flex-col items-center bg-white shadow-lg px-4 py-4 select-none z-40 w-20"
          >
            {/* icon stack, pushed down via pt-6 */}
            <div className="flex-1 w-full overflow-y-auto space-y-4 pt-2 pb-4">
              {ICON_BUTTONS.map(({ Icon, label, badge, action }) => (
                <div key={label} className="relative group">
                  <button
                    aria-label={label}
                    onClick={() => handleIconClick(action)}
                    className="w-10 h-10 mx-auto flex items-center justify-center bg-blue-100 rounded-full shadow hover:shadow-lg transition relative"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    {/* Notification Badge */}
                    {action === "announcements"
                      ? unreadAnnouncements > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {unreadAnnouncements}
                          </div>
                        )
                      : badge && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {badge}
                          </div>
                        )}
                  </button>
                  {/* Tooltip */}
                  <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      {label}
                      {/* Tooltip arrow pointing right */}
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Single collapse toggle at the bottom */}
            <button
              onClick={() => setCollapsed(true)}
              aria-label={ariaLabel}
              className="mt-auto p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ToggleIcon className="w-5 h-5 text-gray-600" />
            </button>
          </aside>

          {/* Robo Notebook Panel */}
          <aside
            data-robo-notebook-panel
            className="fixed top-14 right-20 bottom-0 w-96 bg-white shadow-lg z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {/* Pin Option */}
                <button
                  onClick={handleRoboNotebookPinToggle}
                  className={`p-1 rounded transition ${
                    isRoboNotebookPinned
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title={isRoboNotebookPinned ? "Unpin panel" : "Pin panel"}
                >
                  <PaperClipIcon
                    className={`w-4 h-4 ${
                      isRoboNotebookPinned ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                  Robo Notebook
                </h2>
              </div>
              <button
                onClick={handleCloseRoboNotebook}
                className={`p-1 rounded-full hover:bg-gray-100 transition ${
                  isRoboNotebookPinned ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isRoboNotebookPinned}
                title={
                  isRoboNotebookPinned
                    ? "Panel is pinned - unpin to close"
                    : "Close panel"
                }
              >
                <XMarkIcon className="w-5 h-5 text-red-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
              {/* Illustration */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {/* Stacked Documents */}
                  <div className="relative">
                    {/* Bottom document (yellow) */}
                    <div className="w-24 h-32 bg-yellow-400 rounded-lg relative">
                      <div className="absolute top-2 left-2 right-2 space-y-1">
                        <div className="w-full h-1 bg-yellow-600 rounded"></div>
                        <div className="w-3/4 h-1 bg-yellow-600 rounded"></div>
                        <div className="w-1/2 h-1 bg-yellow-600 rounded"></div>
                      </div>
                    </div>
                    {/* Middle document (red) */}
                    <div className="absolute -top-2 -left-2 w-24 h-32 bg-red-400 rounded-lg"></div>
                    {/* Top document (blue) */}
                    <div className="absolute -top-4 -left-4 w-24 h-32 bg-blue-400 rounded-lg"></div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <p className="text-gray-800 text-center mb-6 max-w-xs">
                Install the Robo Notebook extension to take contextual notes,
                create checklists, upload images, and add documents from any
                screen within Robo Books.
              </p>

              {/* Install Button */}
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Install
              </button>
            </div>
          </aside>
        </>
      );
    }

    // Extensions Panel
    if (extensionsOpen) {
      return (
        <>
          {/* Always show the sidebar */}
          <aside
            data-settings-utils
            className="fixed top-14 right-0 bottom-0 flex flex-col items-center bg-white shadow-lg px-4 py-4 select-none z-40 w-20"
          >
            {/* icon stack, pushed down via pt-6 */}
            <div className="flex-1 w-full overflow-y-auto space-y-4 pt-2 pb-4">
              {ICON_BUTTONS.map(({ Icon, label, badge, action }) => (
                <div key={label} className="relative group">
                  <button
                    aria-label={label}
                    onClick={() => handleIconClick(action)}
                    className="w-10 h-10 mx-auto flex items-center justify-center bg-blue-100 rounded-full shadow hover:shadow-lg transition relative"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    {/* Notification Badge */}
                    {action === "announcements"
                      ? unreadAnnouncements > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {unreadAnnouncements}
                          </div>
                        )
                      : badge && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {badge}
                          </div>
                        )}
                  </button>
                  {/* Tooltip */}
                  <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      {label}
                      {/* Tooltip arrow pointing right */}
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Single collapse toggle at the bottom */}
            <button
              onClick={() => setCollapsed(true)}
              aria-label={ariaLabel}
              className="mt-auto p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ToggleIcon className="w-5 h-5 text-gray-600" />
            </button>
          </aside>

          {/* Extensions Panel */}
          <aside
            data-extensions-panel
            className="fixed top-14 right-20 bottom-0 w-96 bg-white shadow-lg z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {/* Pin Option */}
                <button
                  onClick={handleExtensionsPinToggle}
                  className={`p-1 rounded transition ${
                    isExtensionsPinned
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title={isExtensionsPinned ? "Unpin panel" : "Pin panel"}
                >
                  <PaperClipIcon
                    className={`w-4 h-4 ${
                      isExtensionsPinned ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                  Extensions
                </h2>
              </div>
              <button
                onClick={handleCloseExtensions}
                className={`p-1 rounded-full hover:bg-gray-100 transition ${
                  isExtensionsPinned ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isExtensionsPinned}
                title={
                  isExtensionsPinned
                    ? "Panel is pinned - unpin to close"
                    : "Close panel"
                }
              >
                <XMarkIcon className="w-5 h-5 text-red-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
              {/* Illustration */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {/* Extensions Icon */}
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                    <Cog6ToothIcon className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Message */}
              <p className="text-gray-600 text-center max-w-xs">
                Explore our powerful extensions to enhance your Robo Books
                experience.
              </p>

              {/* Extensions List */}
              <div className="mt-6 w-full max-w-md">
                <div className="bg-gray-100 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                        <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Robo Notebook
                        </h4>
                        <p className="text-xs text-gray-500">
                          Take contextual notes, create checklists, and more.
                        </p>
                      </div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-gray-200 transition">
                      <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                        <InboxIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Robo Invoice
                        </h4>
                        <p className="text-xs text-gray-500">
                          Manage your invoices and payments.
                        </p>
                      </div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-gray-200 transition">
                      <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                        <ListBulletIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Robo Inventory
                        </h4>
                        <p className="text-xs text-gray-500">
                          Track your inventory and manage stock.
                        </p>
                      </div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-gray-200 transition">
                      <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </>
      );
    }

    // Configure Features Panel
    if (configureFeaturesOpen) {
      return (
        <>
          {/* Always show the sidebar */}
          <aside
            data-settings-utils
            className="fixed top-14 right-0 bottom-0 flex flex-col items-center bg-white shadow-lg px-4 py-4 select-none z-40 w-20"
          >
            {/* icon stack, pushed down via pt-6 */}
            <div className="flex-1 w-full overflow-y-auto space-y-4 pt-2 pb-4">
              {ICON_BUTTONS.map(({ Icon, label, badge, action }) => (
                <div key={label} className="relative group">
                  <button
                    aria-label={label}
                    onClick={() => handleIconClick(action)}
                    className="w-10 h-10 mx-auto flex items-center justify-center bg-blue-100 rounded-full shadow hover:shadow-lg transition relative"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    {/* Notification Badge */}
                    {action === "announcements"
                      ? unreadAnnouncements > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {unreadAnnouncements}
                          </div>
                        )
                      : badge && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {badge}
                          </div>
                        )}
                  </button>
                  {/* Tooltip */}
                  <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                      {label}
                      {/* Tooltip arrow pointing right */}
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Single collapse toggle at the bottom */}
            <button
              onClick={() => setCollapsed(true)}
              aria-label={ariaLabel}
              className="mt-auto p-2 rounded-full hover:bg-gray-100 transition"
            >
              <ToggleIcon className="w-5 h-5 text-gray-600" />
            </button>
          </aside>

          {/* Configure Features Panel */}
          <aside
            data-configure-features-panel
            className="fixed top-14 right-20 bottom-0 w-96 bg-white shadow-lg z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {/* Pin Option */}
                <button
                  onClick={handleConfigureFeaturesPinToggle}
                  className={`p-1 rounded transition ${
                    isConfigureFeaturesPinned
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title={
                    isConfigureFeaturesPinned ? "Unpin panel" : "Pin panel"
                  }
                >
                  <PaperClipIcon
                    className={`w-4 h-4 ${
                      isConfigureFeaturesPinned ? "rotate-45" : ""
                    }`}
                  />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                  Configure Features
                </h2>
              </div>
              <button
                onClick={handleCloseConfigureFeatures}
                className={`p-1 rounded-full hover:bg-gray-100 transition ${
                  isConfigureFeaturesPinned
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={isConfigureFeaturesPinned}
                title={
                  isConfigureFeaturesPinned
                    ? "Panel is pinned - unpin to close"
                    : "Close panel"
                }
              >
                <XMarkIcon className="w-5 h-5 text-red-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Subtitle */}
              <p className="text-sm text-gray-600 mb-4">
                Enable the modules required for your business.
              </p>

              {/* Information Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Invoices, Credit Notes, Expenses, Bills, Recurring Invoices
                    and more are available by default in Robo Books.
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                {featureConfig.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <input
                      type="checkbox"
                      id={feature.id}
                      checked={feature.enabled}
                      onChange={() => handleFeatureToggle(feature.id)}
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={feature.id}
                        className="text-sm font-medium text-gray-800 cursor-pointer"
                      >
                        {feature.name}
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  Note: You can change these details later in Settings, if
                  needed.
                </p>
              </div>
            </div>

            {/* Footer with Action Buttons */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelFeatures}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFeatures}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </aside>
        </>
      );
    }

    // Always show the sidebar (default view)
    return (
      <aside
        data-settings-utils
        className="fixed top-14 right-0 bottom-0 flex flex-col items-center bg-white shadow-lg px-4 py-4 select-none z-40 w-20"
      >
        {/* icon stack, pushed down via pt-6 */}
        <div className="flex-1 w-full overflow-y-auto space-y-4 pt-2 pb-4">
          {ICON_BUTTONS.map(({ Icon, label, badge, action }) => (
            <div key={label} className="relative group">
              <button
                aria-label={label}
                onClick={() => handleIconClick(action)}
                className="w-10 h-10 mx-auto flex items-center justify-center bg-blue-100 rounded-full shadow hover:shadow-lg transition relative"
              >
                <Icon className="w-5 h-5 text-gray-600" />
                {/* Notification Badge */}
                {action === "announcements"
                  ? unreadAnnouncements > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {unreadAnnouncements}
                      </div>
                    )
                  : badge && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {badge}
                      </div>
                    )}
              </button>
              {/* Tooltip */}
              <div className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                  {label}
                  {/* Tooltip arrow pointing right */}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Single collapse toggle at the bottom */}
        <button
          onClick={() => setCollapsed(true)}
          aria-label={ariaLabel}
          className="mt-auto p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ToggleIcon className="w-5 h-5 text-gray-600" />
        </button>
      </aside>
    );
  }
}
