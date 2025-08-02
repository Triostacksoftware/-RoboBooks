// src/app/dashboard/components/Header.tsx
import {
  MagnifyingGlassIcon,
  BellIcon,
  Cog6ToothIcon,
  UsersIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline'

export default function Header() {
  return (
    <header className="bg-white border-b">
      {/* Top main nav */}
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-2xl font-bold text-blue-600">Books</div>

          <div className="relative ml-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search in Customers ( / )"
              className="pl-10 pr-4 py-1 border rounded-md w-48 md:w-64 focus:ring"
            />
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-700">
          <span>
            Your premium trial plan is expiring soon.{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Subscribe
            </a>
          </span>
          <span>aat jhat company ▼</span>

          <button className="p-1 hover:bg-gray-100 rounded-full">
            <PlusCircleIcon className="h-6 w-6 text-blue-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded-full">
            <UsersIcon className="h-6 w-6 text-gray-600" />
          </button>
          <button className="relative p-1 hover:bg-gray-100 rounded-full">
            <BellIcon className="h-6 w-6 text-gray-600" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded-full">
            <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
          </button>

          <div className="h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
            T
          </div>
        </div>
      </div>

      {/* Helpline bar */}
      <div className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-1 text-xs text-gray-500 text-right">
          Zoho Books India Helpline: 18003093036 (Mon–Fri • 9:00 AM–7:00 PM • Toll Free){' '}
          <span className="ml-4">
            English, हिंदी, தமிழ், తెలుగు, മലയാളം, ಕನ್ನಡ, मराठी, ગુજરાતી, বাংলা
          </span>
        </div>
      </div>
    </header>
  )
}
