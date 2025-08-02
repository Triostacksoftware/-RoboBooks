export default function ProgressBar({ value = 0 }: { value: number }) {
  return (
    <div className="w-full h-3 bg-gray-100 rounded">
      <div
        className="h-3 bg-blue-500 rounded"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}
