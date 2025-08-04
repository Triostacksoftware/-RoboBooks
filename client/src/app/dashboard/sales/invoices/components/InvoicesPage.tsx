import { FC } from 'react';

const InvoicesPage: FC = () => (
  <section className="space-y-6">
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Invoices</h1>
      <button className="btn-primary">New Invoice</button>
    </header>

    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th className="th">Invoice #</th>
            <th className="th">Customer</th>
            <th className="th">Due Date</th>
            <th className="th text-right">Amount</th>
            <th className="th text-right">Balance</th>
            <th className="th text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="td">INV-0407</td>
            <td className="td">ACME Corp.</td>
            <td className="td">18 Aug 2025</td>
            <td className="td text-right">₹ 40,500</td>
            <td className="td text-right">₹ 40,500</td>
            <td className="td text-right">
              <span className="badge badge-warning">Unpaid</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

export default InvoicesPage;
