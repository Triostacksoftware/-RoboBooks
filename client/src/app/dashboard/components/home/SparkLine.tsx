export default function SparkLine({ data }: { data: number[] }) {
  const w = 600
  const h = 160
  const max = Math.max(...data, 1)
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * (w - 10) + 5
      const y = h - (v / max) * (h - 10) - 5
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * (w - 10) + 5
        const y = h - (v / max) * (h - 10) - 5
        return <circle key={i} cx={x} cy={y} r="2" className="fill-gray-400" />
      })}
    </svg>
  )
}
