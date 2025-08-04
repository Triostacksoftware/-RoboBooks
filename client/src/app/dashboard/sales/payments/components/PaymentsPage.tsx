import { FC } from 'react';

const PaymentsPage: FC = () => (
  <section className="space-y-6">
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Payments Received</h1>
      <button className="btn-primary">Record Payment</button>
    </header>

    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th className="th">Receipt #</th>
            <th className="th">Customer</th>
            <th className="th">Date</th>
            <th className="th text-right">Amount</th>
            <th className="th text-right">Invoice #</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="td">RC-322</td>
            <td className="td">Beta Ltd.</td>
            <td className="td">01 Aug 2025</td>
            <td className="td text-right">₹ 9,800</td>
            <td className="td text-right">INV-0399</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

export default PaymentsPage;
