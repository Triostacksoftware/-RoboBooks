'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function NewItemForm() {
  const [type, setType] = useState<'Goods' | 'Service'>('Goods');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [salesEnabled, setSalesEnabled] = useState(true);
  const [purchaseEnabled, setPurchaseEnabled] = useState(true);
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [salesAccount, setSalesAccount] = useState('Sales');
  const [purchaseAccount, setPurchaseAccount] = useState('Cost of Goods Sold');
  const [salesDescription, setSalesDescription] = useState('');
  const [purchaseDescription, setPurchaseDescription] = useState('');
  const [preferredVendor, setPreferredVendor] = useState('');
  const [description, setDescription] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Autofocus the name field on load
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handleSave = () => {
    const itemData = {
      type,
      name,
      unit,
      salesEnabled,
      sellingPrice,
      salesAccount,
      salesDescription,
      purchaseEnabled,
      costPrice,
      purchaseAccount,
      purchaseDescription,
      preferredVendor,
      description,
    };
    console.log('Saving item:', itemData);
    // TODO: Replace with API submission
  };

  const handleCancel = () => {
    console.log('Form canceled');
    // TODO: Replace with modal close or routing logic
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 md:p-10 text-sm">
      <h2 className="text-2xl font-semibold mb-6">New Item</h2>

      {/* Type, Name, Unit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-6">
        <div className="flex flex-col">
          <label className="font-medium mb-1">Type</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="Goods"
                checked={type === 'Goods'}
                onChange={() => setType('Goods')}
              />
              Goods
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="Service"
                checked={type === 'Service'}
                onChange={() => setType('Service')}
              />
              Service
            </label>
          </div>
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-red-600 mb-1">Name*</label>
          <input
            type="text"
            ref={nameInputRef}
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            className="border rounded px-3 py-2"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="font-medium mb-1">Unit</label>
          <select
            value={unit}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setUnit(e.target.value)
            }
            className="border rounded px-3 py-2"
          >
            <option value="">Select or type to add</option>
            <option value="Piece">Piece</option>
            <option value="Kg">Kg</option>
            <option value="Liter">Liter</option>
          </select>
        </div>
      </div>

      {/* Sales & Purchase Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Sales Information */}
        <div className="border rounded p-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={salesEnabled}
              onChange={() => setSalesEnabled(!salesEnabled)}
            />
            <h3 className="font-semibold">Sales Information</h3>
          </div>

          {salesEnabled && (
            <>
              <div className="mb-3">
                <label className="block text-red-600 mb-1">Selling Price*</label>
                <div className="flex gap-1">
                  <span className="border rounded-l px-3 py-2 bg-gray-100">INR</span>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSellingPrice(e.target.value)
                    }
                    className="border rounded-r px-3 py-2 w-full"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-red-600 mb-1">Account*</label>
                <select
                  value={salesAccount}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSalesAccount(e.target.value)
                  }
                  className="border rounded px-3 py-2 w-full"
                >
                  <option>Sales</option>
                  <option>Services</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  value={salesDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setSalesDescription(e.target.value)
                  }
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </>
          )}
        </div>

        {/* Purchase Information */}
        <div className="border rounded p-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={purchaseEnabled}
              onChange={() => setPurchaseEnabled(!purchaseEnabled)}
            />
            <h3 className="font-semibold">Purchase Information</h3>
          </div>

          {purchaseEnabled && (
            <>
              <div className="mb-3">
                <label className="block text-red-600 mb-1">Cost Price*</label>
                <div className="flex gap-1">
                  <span className="border rounded-l px-3 py-2 bg-gray-100">INR</span>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCostPrice(e.target.value)
                    }
                    className="border rounded-r px-3 py-2 w-full"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-red-600 mb-1">Account*</label>
                <select
                  value={purchaseAccount}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setPurchaseAccount(e.target.value)
                  }
                  className="border rounded px-3 py-2 w-full"
                >
                  <option>Cost of Goods Sold</option>
                  <option>Purchase</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  value={purchaseDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setPurchaseDescription(e.target.value)
                  }
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Extra Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setDescription(e.target.value)
            }
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block mb-1">Preferred Vendor</label>
          <input
            type="text"
            value={preferredVendor}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPreferredVendor(e.target.value)
            }
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      {/* Inventory Note */}
      <div className="text-gray-600 text-sm mb-6">
        Do you want to keep track of this item?{' '}
        <span className="font-semibold">Enable Inventory</span> to view its stock based on the sales
        and purchase transactions you record for it. Go to{' '}
        <span className="italic font-medium">Settings &gt; Preferences &gt; Items</span> and enable
        inventory.
      </div>

      {/* Action Buttons */}
      <div className="flex justify-start gap-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="border border-gray-300 text-gray-700 px-5 py-2 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
