import { FC } from 'react';

const CustomersPage: FC = () => (
  <section className="space-y-6">
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Customers</h1>
      <button className="btn-primary">Add New Customer</button>
    </header>

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="th">Name</th>
            <th className="th">Email</th>
            <th className="th">Phone</th>
            <th className="th text-right">Outstanding</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {/* Replace with mapped data */}
          <tr>
            <td className="td">ACME Corp.</td>
            <td className="td">billing@acme.com</td>
            <td className="td">+91 98765 43210</td>
            <td className="td text-right">₹ 12,000</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

export default CustomersPage;
