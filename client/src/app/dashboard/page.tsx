// src/app/dashboard/page.tsx
'use client'

import Card from './components/Card'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Row 1: Receivables & Payables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Total Receivables" actionText="New">
          <div className="text-sm text-gray-500">Total Unpaid Invoices ₹0.00</div>
          <div className="text-3xl font-semibold my-2">₹0.00</div>
          <div className="flex justify-between">
            <div>
              <div className="text-xs text-blue-500">CURRENT</div>
              <div className="font-medium">₹0.00</div>
            </div>
            <div>
              <div className="text-xs text-red-500">OVERDUE</div>
              <div className="font-medium">₹0.00</div>
            </div>
          </div>
        </Card>

        <Card title="Total Payables" actionText="New">
          <div className="text-sm text-gray-500">Total Unpaid Bills ₹0.00</div>
          <div className="text-3xl font-semibold my-2">₹0.00</div>
          <div className="flex justify-between">
            <div>
              <div className="text-xs text-blue-500">CURRENT</div>
              <div className="font-medium">₹0.00</div>
            </div>
            <div>
              <div className="text-xs text-red-500">OVERDUE</div>
              <div className="font-medium">₹0.00</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Cash Flow & Income/Expense + Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Cash Flow">
          <div className="h-48 bg-gray-100 rounded flex items-end p-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 mx-1 rounded-t ${
                  i % 2 ? 'h-16' : 'h-24'
                } bg-green-300`}
              />
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card title="Income and Expense">
            <div className="h-48 bg-gray-100 rounded" />
          </Card>
          <Card title="Top Expenses">
            <div className="h-48 flex items-center justify-center text-gray-400">
              No expense recorded for this fiscal year
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3: Projects & Bank/Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Projects" actionText="Add">
          <div className="h-32 flex items-center justify-center text-blue-600">
            Add Project(s) to this watchlist
          </div>
        </Card>
        <Card title="Bank and Credit Cards" actionText="Add">
          <div className="h-32 flex items-center justify-center text-blue-600">
            Yet to add Bank and Credit Card details
          </div>
        </Card>
      </div>

      {/* Row 4: Account Watchlist */}
      <Card title="Account Watchlist">
        <div className="h-32 flex items-center justify-center text-gray-400">
          No items to watch
        </div>
      </Card>
    </div>
  )
}
