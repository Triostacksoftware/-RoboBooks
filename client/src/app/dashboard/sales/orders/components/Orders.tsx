'use client'; // ← STEP 1: tells Next it's a Client Component

import { FC } from 'react';

const OrdersPage: FC = () => (
  <section className="space-y-6">
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Sales Orders</h1>
      <button className="btn-primary">New Sales Order</button>
    </header>

    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th className="th">Order #</th>
            <th className="th">Customer</th>
            <th className="th">Date</th>
            <th className="th text-right">Amount</th>
            <th className="th text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="td">SO-0101</td>
            <td className="td">Beta Ltd.</td>
            <td className="td">03 Aug 2025</td>
            <td className="td text-right">₹ 9,800</td>
            <td className="td text-right">
              <span className="badge badge-info">Open</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
);

export default OrdersPage;
