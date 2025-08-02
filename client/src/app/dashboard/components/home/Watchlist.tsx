import Card from './Card'
import Dropdown from './Dropdown'

export default function Watchlist() {
  return (
    <Card
      title="Account Watchlist"
      right={<Dropdown label="Accrual" items={['Accrual', 'Cash']} />}
    >
      <div className="h-56" />
    </Card>
  )
}
