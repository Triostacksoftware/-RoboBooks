import React from "react";
import { MoreHorizontal, ChevronRight } from "lucide-react";

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
}

const AccountTable: React.FC<AccountTableProps> = ({
  accounts,
  onAccountClick,
  onEditAccount,
}) => {
  const formatBalance = (balance: number, balanceType: "credit" | "debit") => {
    return `₹${balance.toFixed(2)} ${balanceType.toUpperCase()}`;
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
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => onAccountClick(account)}
              >
                {/* Accounts Column */}
                <td className="py-4 px-6">
                  <div className="flex items-center">
                    {account.subAccountCount > 0 && (
                      <ChevronRight className="h-4 w-4 text-gray-400 mr-2" />
                    )}
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
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
                  <div className="text-sm font-medium text-gray-900">
                    {account.accountHead}
                  </div>
                </td>

                {/* Account Group Column */}
                <td className="py-4 px-6 text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {account.accountGroup}
                  </div>
                </td>

                {/* Balance Column */}
                <td className="py-4 px-6 text-right">
                  <div className="text-sm text-gray-900">
                    {formatBalance(account.balance, account.balanceType)}
                  </div>
                </td>

                {/* Actions Column */}
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAccount(account);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
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
