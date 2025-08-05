'use client';

import {
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowPathRoundedSquareIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';

export default function PurchaseOrderLifecycle() {
  return (
    <section className="w-full px-4 py-10 md:py-14 bg-[#f9fafb] flex flex-col items-center space-y-10">
      {/* Title */}
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center">
        Life cycle of a Purchase Order
      </h2>

      {/* Flowchart */}
      <div className="w-full max-w-4.2xl flex justify-center overflow-x-auto">
        <div className="flex items-center gap-4 sm:gap-6 min-w-[550px]">
          <Step icon={<DocumentTextIcon className="w-5 h-5 text-blue-600" />} label="RAISE PURCHASE ORDER" />
          <ArrowLabel label="CONVERT TO OPEN" />
          <Step icon={<CheckCircleIcon className="w-5 h-5 text-green-600" />} label="RECEIVE GOODS" highlighted />
          <ArrowLabel label="CONVERT TO BILL" />
          <Step icon={<ReceiptPercentIcon className="w-5 h-5 text-purple-600" />} label="CONVERT TO BILL" />
          <ArrowLabel label="" />
          <Step icon={<BanknotesIcon className="w-5 h-5 text-blue-600" />} label="RECORD PAYMENT" />
        </div>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-gray-300 max-w-6xl" />

      {/* Features */}
      <div className="max-w-3xl w-full text-center space-y-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
          In the Purchase Orders module, you can:
        </h3>
        <ul className="space-y-3 text-sm text-gray-700 text-left px-4 sm:px-8">
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="w-4 h-4 text-blue-600 mt-1" />
            <span>Create and send a purchase order to your vendors when you are in need of a product.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="w-4 h-4 text-blue-600 mt-1" />
            <span>Convert the purchase order into a bill after you receive an invoice for your purchase.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircleIcon className="w-4 h-4 text-blue-600 mt-1" />
            <span>Set conditions that determine when a purchase order is marked as closed.</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

type StepProps = {
  icon: React.ReactNode;
  label: string;
  highlighted?: boolean;
};

function Step({ icon, label, highlighted }: StepProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg shadow-sm min-w-[140px] justify-center text-center 
        ${highlighted ? 'bg-green-50 border-green-200' : 'bg-white border-blue-200'}`}
    >
      {icon}
      <span className="text-xs font-medium text-gray-800">{label}</span>
    </div>
  );
}

function ArrowLabel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center text-[10px] text-gray-500 font-semibold">
      <div className="w-8 h-px bg-blue-300 mb-1 border-dashed border-b-2" />
      {label && <span className="whitespace-nowrap">{label}</span>}
      <div className="w-8 h-px bg-blue-300 mt-1 border-dashed border-b-2" />
    </div>
  );
}
