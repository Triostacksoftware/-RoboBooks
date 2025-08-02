// src/app/dashboard/components/Sidebar.tsx
import Link from 'next/link'
import {
  HomeIcon,
  CubeIcon,
  BanknotesIcon,
  UsersIcon,
  ShoppingCartIcon,
  ClockIcon,
  ClipboardIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { name: 'Home', icon: HomeIcon, href: '/dashboard' },
  { name: 'Items', icon: CubeIcon, href: '/dashboard/items' },
  { name: 'Banking', icon: BanknotesIcon, href: '/dashboard/banking' },
  { name: 'Sales', icon: UsersIcon, href: '/dashboard/sales' },
  { name: 'Purchases', icon: ShoppingCartIcon, href: '/dashboard/purchases' },
  { name: 'Time Tracking', icon: ClockIcon, href: '/dashboard/time' },
  { name: 'Accountant', icon: ClipboardIcon, href: '/dashboard/accountant' },
  { name: 'Reports', icon: ChartBarIcon, href: '/dashboard/reports' },
  { name: 'Documents', icon: DocumentTextIcon, href: '/dashboard/documents' },
  { name: 'Payroll', icon: CurrencyRupeeIcon, href: '/dashboard/payroll' },
  { name: 'Configure Features', icon: Cog6ToothIcon, href: '/dashboard/configure' },
]

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r overflow-y-auto">
      <div className="p-4 text-xl font-semibold">Books</div>
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => (
          <Link href={item.href} key={item.name}>
            <a className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </a>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
