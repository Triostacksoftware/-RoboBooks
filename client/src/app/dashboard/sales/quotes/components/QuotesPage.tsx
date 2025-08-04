import { FC } from 'react';

const QuotesPage: FC = () => (
  <section className="space-y-6">
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Quotes</h1>
      <button className="btn-primary">New Quote</button>
    </header>

    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th className="th">Quote #</th>
            <th className="th">Customer</th>
            <th className="th">Date</th>
            <th className="th text-right">Amount</th>
            <th className="th text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="td">QT-0024</td>
            <td className="td">ACME Corp.</td>
            <td className="td">04 Aug 2025</td>
            <td className="td text-right">₹ 25,000</td>
            <td className="td text-right">
              <span className="badge">Sent</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

export default QuotesPage;
