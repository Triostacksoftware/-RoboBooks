'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export default function Dropdown({
  label,
  items,
  onChange,
}: {
  label: string
  items: string[]
  onChange?: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(label)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  return (
    <div className="relative inline-block text-sm" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border hover:bg-gray-50"
      >
        {value}
        <ChevronDownIcon className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white border shadow rounded-md z-10">
          {items.map((it) => (
            <button
              key={it}
              onClick={() => {
                setValue(it)
                setOpen(false)
                onChange?.(it)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50"
            >
              {it}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
