import React, { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  ChevronRight,
  Edit,
  Trash2,
  Archive,
  X,
} from "lucide-react";

interface Account {
  _id: string;
  name: string;
  accountHead: string;
  accountGroup: string;
  balance: number;
  balanceType: "credit" | "debit";
  subAccountCount?: number;
  isParent?: boolean;
  parentId?: string;
  code?: string;
  description?: string;
  isActive: boolean;
}

interface AccountTableProps {
  accounts: Account[];
  onAccountClick: (account: Account) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (accountId: string) => void;
  onArchiveAccount: (accountId: string) => void;
}

const AccountTable: React.FC<AccountTableProps> = ({
  accounts,
  onAccountClick,
  onEditAccount,
  onDeleteAccount,
  onArchiveAccount,
}) => {
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionMenu) {
        const ref = actionMenuRefs.current[openActionMenu];
        if (ref && !ref.contains(event.target as Node)) {
          setOpenActionMenu(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openActionMenu]);

  const formatBalance = (balance: number, balanceType: "credit" | "debit") => {
    // Change CREDIT/DEBIT to Cr/Dr
    const shortBalanceType = balanceType === "credit" ? "Cr" : "Dr";
    return `₹${balance.toFixed(2)} ${shortBalanceType}`;
  };

  const handleActionClick = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation();
    setOpenActionMenu(openActionMenu === accountId ? null : accountId);
  };

  const handleAction = (
    e: React.MouseEvent,
    action: string,
    accountId: string
  ) => {
    e.stopPropagation();
    setOpenActionMenu(null);

    switch (action) {
      case "edit":
        const account = accounts.find((acc) => acc._id === accountId);
        if (account) onEditAccount(account);
        break;
      case "delete":
        onDeleteAccount(accountId);
        break;
      case "archive":
        onArchiveAccount(accountId);
        break;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                Accounts
              </th>
              <th className="text-center py-3 px-6 text-sm font-medium text-gray-700">
                Account Type
              </th>
              <th className="text-center py-3 px-6 text-sm font-medium text-gray-700">
                Account Group
              </th>
              <th className="text-right py-3 px-6 text-sm font-medium text-gray-700">
                Balance
              </th>
              <th className="text-right py-3 px-6 text-sm font-medium text-gray-700 w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account, index) => (
              <tr
                key={account._id}
                className={`border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                  !account.isActive
                    ? "opacity-70 bg-gray-100 hover:bg-gray-150 text-gray-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => onAccountClick(account)}
              >
                {/* Accounts Column */}
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    {account.subAccountCount > 0 && (
                      <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                    )}
                    <div className="flex flex-col">
                      <div
                        className={`text-sm font-medium ${
                          !account.isActive ? "text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {account.name}
                      </div>
                      {account.subAccountCount > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {account.subAccountCount} account
                          {account.subAccountCount !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Account Type Column */}
                <td className="py-4 px-6 text-center">
                  <div
                    className={`text-sm font-medium ${
                      !account.isActive ? "text-gray-500" : "text-gray-900"
                    }`}
                  >
                    {account.accountHead}
                  </div>
                </td>

                {/* Account Group Column */}
                <td className="py-4 px-6 text-center">
                  <div
                    className={`text-sm font-medium ${
                      !account.isActive ? "text-gray-500" : "text-gray-900"
                    }`}
                  >
                    {account.accountGroup}
                  </div>
                </td>

                {/* Balance Column */}
                <td className="py-4 px-6 text-right">
                  <div
                    className={`text-sm ${
                      !account.isActive ? "text-gray-500" : "text-gray-900"
                    }`}
                  >
                    {formatBalance(account.balance, account.balanceType)}
                  </div>
                </td>

                {/* Actions Column */}
                <td className="py-4 px-6 text-right relative">
                  <button
                    onClick={(e) => handleActionClick(e, account._id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  {/* Enhanced Actions Popup Menu */}
                  {openActionMenu === account._id && (
                    <div
                      ref={(el) => (actionMenuRefs.current[account._id] = el)}
                      className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 ring-1 ring-black ring-opacity-5"
                    >
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Account Actions
                          </p>
                        </div>

                        <button
                          onClick={(e) => handleAction(e, "edit", account._id)}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center transition-colors duration-150"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 mr-3">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">Update Account</div>
                            <div className="text-xs text-gray-500">
                              Edit account details
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={(e) =>
                            handleAction(e, "archive", account._id)
                          }
                          className={`w-full px-4 py-3 text-left text-sm hover:bg-yellow-50 hover:text-yellow-700 flex items-center transition-colors duration-150 ${
                            account.isActive
                              ? "text-gray-700"
                              : "text-yellow-700"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 ${
                              account.isActive
                                ? "bg-yellow-100"
                                : "bg-green-100"
                            }`}
                          >
                            <Archive
                              className={`h-4 w-4 ${
                                account.isActive
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-medium">
                              {account.isActive
                                ? "Archive Account"
                                : "Unarchive Account"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {account.isActive
                                ? "Hide from active accounts"
                                : "Restore to active accounts"}
                            </div>
                          </div>
                        </button>

                        <div className="border-t border-gray-100 mt-1">
                          <button
                            onClick={(e) =>
                              handleAction(e, "delete", account._id)
                            }
                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center transition-colors duration-150"
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 mr-3">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <div className="font-medium">Delete Account</div>
                              <div className="text-xs text-gray-500">
                                Permanently remove account
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-700">
          <div className="flex items-center gap-4">
            <span>Rows per page: 50</span>
            <span>
              1-{accounts.length} of {accounts.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 text-gray-400 hover:text-gray-600">←</button>
            <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
              1
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-600">→</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountTable;
