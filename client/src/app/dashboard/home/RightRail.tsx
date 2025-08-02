'use client'
import { QuestionMarkCircleIcon, MegaphoneIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

export default function RightRail() {
  const items = [
    { icon: QuestionMarkCircleIcon, label: 'Help' },
    { icon: MegaphoneIcon, label: 'Announcements' },
    { icon: ChatBubbleLeftRightIcon, label: 'Feedback' },
    { icon: DocumentTextIcon, label: 'Docs' },
    { icon: Cog6ToothIcon, label: 'Settings' },
  ]

  return (
    <div className="hidden md:flex fixed right-2 top-[140px] z-20 flex-col gap-3">
      {items.map(({ icon: Icon, label }) => (
        <button key={label} className="h-10 w-10 rounded-full border bg-white shadow-sm flex items-center justify-center hover:bg-gray-50" title={label}>
          <Icon className="h-5 w-5 text-gray-600" />
        </button>
      ))}
    </div>
  )
}
