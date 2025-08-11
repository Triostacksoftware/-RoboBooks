"use client";
import React, { useEffect, useState } from 'react';
import { Quote, quotesApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';

const EditQuotePage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<Partial<Quote> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await quotesApi.getById(id);
      setForm(res.data);
    };
    if (id) load();
  }, [id]);

  if (!form) return <div className="p-6">Loading...</div>;

  const handleChange = (key: keyof Quote, value: any) =>
    setForm((f) => ({ ...(f as Quote), [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await quotesApi.update((form as Quote)._id!, form!);
      router.push(`/dashboard/sales/quotes/${(form as Quote)._id}`);
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-xl font-semibold mb-4">Edit Quote {form.quoteNumber}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Customer Id</label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={(form.customer_id as any)?._id || (form.customer_id as string) || ''}
                onChange={(e) => handleChange('customer_id', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Valid Until</label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2"
                value={new Date(form.valid_until || '').toISOString().slice(0, 10)}
                onChange={(e) => handleChange('valid_until', new Date(e.target.value).toISOString())}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Subtotal</label>
              <input type="number" className="w-full border rounded-md px-3 py-2" value={form.subtotal ?? 0} onChange={(e) => handleChange('subtotal', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tax</label>
              <input type="number" className="w-full border rounded-md px-3 py-2" value={form.taxTotal ?? 0} onChange={(e) => handleChange('taxTotal', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Total</label>
              <input type="number" className="w-full border rounded-md px-3 py-2" value={form.total ?? 0} onChange={(e) => handleChange('total', Number(e.target.value))} />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" className="px-4 py-2 border rounded-md" onClick={() => router.back()}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuotePage;


