'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConnectBankSection() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleConnectNow = () => {
    setShowModal(true);
  };

  const handleProceed = () => {
    if (agree) {
      setShowModal(false);
      router.push('/banking/feed-connect');
    } else {
      alert('Please agree to the terms to proceed.');
    }
  };

  const handleAddAccount = () => {
    router.push('/dashboard/banking/connect/manual-add');
  };

  const partnerBanks = [
    { name: 'Standard Chartered', logo: '/bank-logos/standard-chartered.png' },
    { name: 'HSBC', logo: '/bank-logos/hsbc.png' },
    { name: 'Kotak', logo: '/bank-logos/kotak.png' },
    { name: 'YES BANK', logo: '/bank-logos/yesbank.png' },
    { name: 'SBI', logo: '/bank-logos/sbi.png' },
  ];

  const supportedBanks = [
    { name: 'PayPal', logo: '/bank-logos/paypal.png' },
    { name: 'ICICI Bank (India)', logo: '/bank-logos/icici.png' },
    { name: 'HDFC Bank (India)', logo: '/bank-logos/hdfc.png' },
    { name: 'State Bank of India (India)', logo: '/bank-logos/sbi.png' },
    { name: 'Kotak Mahindra Bank', logo: '/bank-logos/kotak.png' },
    { name: 'Axis Bank (India)', logo: '/bank-logos/axis.png' },
    { name: 'American Express Card', logo: '/bank-logos/amex.png' },
  ];

  return (
    <div className="w-full p-6 space-y-8 bg-white">
      {/* Header */}
      <div className="bg-orange-50 p-4 border rounded flex items-start gap-4">
        <span className="text-2xl">✨</span>
        <div>
          <h2 className="text-lg font-semibold">
            Connect and Add Your Bank Accounts or Credit Cards
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Connect your bank accounts to fetch the bank feeds using one of our third-party bank
            feeds service providers. Or, you can add your bank accounts manually and import bank
            feeds.
          </p>
        </div>
      </div>

      {/* Partner Banks */}
      <div>
        <h3 className="font-medium text-gray-800 mb-3">Partner Banks Fetch feeds directly</h3>
        <div className="flex flex-wrap gap-4">
          {partnerBanks.map((bank) => (
            <div
              key={bank.name}
              className="p-3 border rounded-md bg-gray-50 flex items-center justify-center"
            >
              <img src={bank.logo} alt={bank.name} className="h-10 object-contain" />
            </div>
          ))}
        </div>
      </div>

      {/* Supported Banks */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          <h3 className="font-medium text-gray-800">
            Automatic Bank Feeds Supported Banks
          </h3>
          <button
            onClick={handleConnectNow}
            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded hover:bg-blue-700"
          >
            Connect Now
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          Connect your bank accounts and fetch the bank feeds using one of our third-party bank
          feeds service providers.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {supportedBanks.map((bank) => (
            <div
              key={bank.name}
              className="flex items-center gap-3 p-3 border bg-white rounded-md"
            >
              <img src={bank.logo} alt={bank.name} className="w-6 h-6 object-contain" />
              <span className="text-sm">{bank.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Add */}
      <div className="rounded-lg border bg-white p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-blue-500 text-xl">➕</span>
          Add bank or credit card account manually
        </h3>
        <p className="text-sm text-gray-600">
          Unable to connect your bank or credit card account using our Service Provider? Add the
          accounts manually using your account details.
        </p>
        <div>
          <button
            onClick={handleAddAccount}
            className="ml-auto mt-2 border border-gray-300 text-sm px-4 py-2 rounded hover:bg-gray-100"
          >
            Add Account
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl relative border border-gray-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl"
            >
              &times;
            </button>

            <h3 className="text-lg font-semibold mb-2">
              Connect and add your bank or credit card accounts
            </h3>

            <p className="text-sm text-gray-700 mb-4">
              The End User License Agreement (EULA) describes the terms and conditions under which
              you may use the Automatic Bank Feeds. Please read and agree to all terms.
            </p>

            <div className="flex items-start gap-2 mb-4">
              <input
                type="checkbox"
                className="mt-1"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label className="text-sm text-gray-700">
                I agree to all the{' '}
                <a
                  href="https://example.com/eula"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  terms for automatic bank feeds
                </a>.
              </label>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={handleProceed}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Proceed
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
