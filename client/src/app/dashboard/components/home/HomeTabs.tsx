import { PlusIcon } from '@heroicons/react/24/outline'

export default function HomeTabs() {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg border flex items-center justify-center">🏷️</div>
          <div>
            <div className="text-xl md:text-2xl font-semibold">Hello, Try</div>
            <div className="text-gray-500 -mt-1 text-sm">aat jhat company</div>
          </div>
        </div>

        <div className="text-right hidden md:block">
          <div className="text-xs text-gray-600">
            Zoho Books India Helpline: <span className="font-semibold">18003093036</span>
          </div>
          <div className="text-[11px] text-gray-500">
            Mon - Fri • 9:00 AM - 7:00 PM • Toll Free
          </div>
          <div className="text-[11px] text-gray-400">
            English, हिंदी, தமிழ், తెలుగు, മലയാളം, ಕನ್ನಡ, मराठी, ગુજરાતી, বাংলা
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-b">
        <div className="flex gap-8 text-sm">
          <button className="px-1 pb-3 border-b-2 border-blue-600 text-blue-600">Dashboard</button>
          <button className="px-1 pb-3 hover:text-gray-800 text-gray-500">Getting Started</button>
          <button className="px-1 pb-3 hover:text-gray-800 text-gray-500">Recent Updates</button>
        </div>
        <button className="text-blue-600 inline-flex items-center gap-1 py-2">
          <PlusIcon className="h-5 w-5" /> New Dashboard
        </button>
      </div>
    </div>
  )
}
