import { FC } from 'react';

const RecurringPage: FC = () => (
  <section className="space-y-6">
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Recurring Invoices</h1>
      <button className="btn-primary">Create Recurring Profile</button>
    </header>

    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th className="th">Profile #</th>
            <th className="th">Customer</th>
            <th className="th">Start Date</th>
            <th className="th">Frequency</th>
            <th className="th text-right">Next Invoice</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="td">RP-007</td>
            <td className="td">Gamma Inc.</td>
            <td className="td">01 Jul 2025</td>
            <td className="td">Monthly</td>
            <td className="td text-right">01 Sep 2025</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

export default RecurringPage;
