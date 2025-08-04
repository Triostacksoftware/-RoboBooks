import { FC } from 'react';

const CreditsPage: FC = () => (
  <section className="space-y-6">
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Credit Notes</h1>
      <button className="btn-primary">New Credit Note</button>
    </header>

    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th className="th">Credit #</th>
            <th className="th">Customer</th>
            <th className="th">Date</th>
            <th className="th text-right">Amount</th>
            <th className="th text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="td">CN-011</td>
            <td className="td">ACME Corp.</td>
            <td className="td">29 Jul 2025</td>
            <td className="td text-right">₹ 1,500</td>
            <td className="td text-right">
              <span className="badge badge-success">Open</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

export default CreditsPage;
