'use client'

import HomeTabs from './components/home/HomeTabs'
import MetricCard from './components/home/MetricCard'
import CashFlow from './components/home/CashFlow'
import IncomeExpense from './components/home/IncomeExpense'
import TopExpenses from './components/home/TopExpenses'
import Projects from './components/home/Projects'
import BankAndCards from './components/home/BankAndCards'
import Watchlist from './components/home/Watchlist'
import Footer from './components/home/Footer'
import RightRail from './components/home/RightRail'

export default function DashboardHome() {
  return (
    <div className="relative">
      {/* right sticky rail like the screenshots */}
      <RightRail />

      <div className="mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 pb-10">
        {/* Greeting + Tabs */}
        <HomeTabs />

        {/* Row 1: Receivables & Payables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
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

        {/* Row 2: Cash Flow + Income/Expense & Top Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <CashFlow />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <IncomeExpense />
            <TopExpenses />
          </div>
        </div>

        {/* Row 3: Projects & Bank/Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <Projects />
          <BankAndCards />
        </div>

        {/* Row 4: Account Watchlist */}
        <div className="mb-8">
          <Watchlist />
        </div>

        {/* Big footer block like images */}
        <Footer />
      </div>
    </div>
  )
}
