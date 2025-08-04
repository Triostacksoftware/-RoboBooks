'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LinkIcon } from '@heroicons/react/24/outline';

export default function EmptyVendors() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // "Create New Vendor" click
  const handleCreateVendor = () => {
    router.push('/dashboard/vendors/create'); // Change route as needed
  };

  // Import click
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // File selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Selected file: ${file.name}`);
      e.target.value = '';
    }
  };

  // Link icon click
  const handleLinkIconClick = () => {
    alert('Integrate with external service!');
    // router.push('/dashboard/vendors/integrate');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-2">
      <h1 className="text-lg md:text-xl font-semibold text-center text-gray-900 mb-1">
        Business is no fun without people.
      </h1>
      <p className="text-gray-500 text-sm md:text-base text-center mb-5">
        Create and manage your contacts, all in one place.
      </p>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md px-5 py-2 text-sm md:text-base transition mb-3 shadow-sm"
        type="button"
        onClick={handleCreateVendor}
      >
        CREATE NEW VENDOR
      </button>
      <button
        className="text-blue-600 hover:underline text-sm md:text-base mb-7"
        type="button"
        onClick={handleImportClick}
      >
        Click here to import vendors from file
      </button>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex items-center gap-1 text-gray-400 text-sm md:text-base">
        or using
        <button
          className="ml-1 p-1 rounded-full hover:bg-blue-100 transition"
          type="button"
          aria-label="Integrate"
          onClick={handleLinkIconClick}
        >
          <LinkIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
        </button>
      </div>
    </div>
  );
}
