'use client'

import HomeTabs from './home/HomeTabs'
import MetricCard from './home/MetricCard'
import CashFlow from './home/CashFlow'
import IncomeExpense from './home/IncomeExpense'
import TopExpenses from './home/TopExpenses'
import Projects from './home/Projects'
import BankAndCards from './home/BankAndCards'
import Watchlist from './home/Watchlist'
import Footer from './home/Footer'

export default function DashboardHome() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-8 lg:px-12 pb-10">
      {/* Header Tabs */}
      <HomeTabs />

      {/* Row 1: Receivables & Payables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <MetricCard
          title="Total Receivables"
          subtitle="Total Unpaid Invoices ₹0.00"
          current="₹0.00"
          overdue="₹0.00"
        />
        <MetricCard
          title="Total Payables"
          subtitle="Total Unpaid Bills ₹0.00"
          current="₹0.00"
          overdue="₹0.00"
        />
      </div>

      {/* Row 2: Cash Flow, Income/Expense, Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="col-span-1">
          <CashFlow />
        </div>
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <IncomeExpense />
          <TopExpenses />
        </div>
      </div>

      {/* Row 3: Projects & Bank and Credit Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Projects />
        <BankAndCards />
      </div>

      {/* Row 4: Account Watchlist */}
      <div className="mb-8">
        <Watchlist />
      </div>

      {/* Footer with info, links, QR, etc. */}
      <Footer />
    </div>
  );
}
