import React from "react";

interface AccountTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AccountTabs: React.FC<AccountTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "all", label: "All Accounts" },
    { id: "asset", label: "Asset" },
    { id: "liability", label: "Liability" },
    { id: "income", label: "Income" },
    { id: "expense", label: "Expense" },
    { id: "equity", label: "Equity" },
  ];

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AccountTabs;
