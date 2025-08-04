import { FC } from 'react';

const ChallansPage: FC = () => (
  <section className="space-y-6">
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Delivery Challans</h1>
      <button className="btn-primary">New Challan</button>
    </header>

    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th className="th">Challan #</th>
            <th className="th">Customer</th>
            <th className="th">Date</th>
            <th className="th text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="td">DC-150</td>
            <td className="td">Gamma Inc.</td>
            <td className="td">02 Aug 2025</td>
            <td className="td text-right">
              <span className="badge badge-success">Delivered</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

export default ChallansPage;
