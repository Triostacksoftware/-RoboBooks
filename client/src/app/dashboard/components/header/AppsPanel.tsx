'use client'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Portal, useKey } from './hooks'

export default function AppsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  useKey('Escape', onClose, open)
  if (!open) return null

  const SectionList = ({ title, items }: { title: string; items: { name: string; desc?: string }[] }) => (
    <div className="mt-6">
      <div className="text-xs font-semibold text-gray-500">{title}</div>
      <div className="mt-2 space-y-3">
        {items.map((app) => (
          <div key={app.name} className="flex items-center justify-between rounded-xl border p-3 hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100" />
              <div>
                <div className="font-medium">{app.name}</div>
                {app.desc && <div className="text-xs text-gray-500">{app.desc}</div>}
              </div>
            </div>
            <div>›</div>
          </div>
        ))}
      </div>
    </div>
  )

  const IconGrid = ({ title, items }: { title: string; items: string[] }) => (
    <div className="mt-6">
      <div className="text-xs font-semibold text-gray-500">{title}</div>
      <div className="mt-3 grid grid-cols-4 gap-4 sm:grid-cols-5">
        {items.map((name) => (
          <div key={name} className="flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-gray-50">
            <div className="h-10 w-10 rounded-xl bg-gray-100" />
            <div className="text-xs text-gray-700">{name}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <Portal>
      <div className="fixed inset-0 z-[85]" onClick={onClose} />
      <div className="absolute right-2 top-14 z-[90] w-[520px] max-w-[95vw] rounded-xl border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-lg font-semibold">All Zoho Apps</div>
          <div className="flex items-center gap-2">
            <MagnifyingGlassIcon className="h-5 w-5" />
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-4">
          <SectionList
            title="FINANCE APPS"
            items={[
              { name: 'Zoho Expense', desc: 'Expense Reporting Software' },
              { name: 'Zoho Billing', desc: 'End-to-end Billing Solution' },
              { name: 'Zoho Inventory', desc: 'Order & Inventory Management Software' },
              { name: 'Zoho Checkout', desc: 'One-time and recurring payments software.' },
              { name: 'Zoho Commerce', desc: 'Ecommerce software.' },
              { name: 'Zoho Payroll', desc: 'Simplified Payroll Management Software' },
            ]}
          />

          <div className="mt-6 text-xs font-semibold text-gray-500">Other Apps</div>

          <IconGrid
            title="EMAIL AND COLLABORATION"
            items={['Notebook','Meeting','Projects','Sign','Sprints','TeamInbox','Mail','Cliq','Sheet','Show','Writer','Connect','Vault','WorkDrive','Learn']}
          />
          <IconGrid title="SALES" items={['CRM','SalesIQ','SalesInbox','Bigin','Bookings','Commerce']} />
          <IconGrid title="MARKETING" items={['Sites','Campaigns','Survey','Backstage','Forms','MarketingHub','PageSense','Social']} />
          <IconGrid title="HELP DESK AND CUSTOMER SUPPORT" items={['Desk','Lens','Assist']} />
          <IconGrid title="HUMAN RESOURCES" items={['People','Recruit']} />
          <IconGrid title="BUSINESS PROCESS" items={['Analytics','Creator','Flow','Qntrl','DataPrep','RPA']} />
        </div>
      </div>
    </Portal>
  )
}
