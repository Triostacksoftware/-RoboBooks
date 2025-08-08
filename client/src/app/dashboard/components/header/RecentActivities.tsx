'use client';

import { useLayoutEffect, useState } from 'react';
import { createPortal }         from 'react-dom';
import { useKey }               from './hooks';
import { 
  DocumentTextIcon,
  ClockIcon,
  PlusIcon,
  UserIcon,
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  CreditCardIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
}     from '@heroicons/react/24/outline';

interface RecentActivitiesProps {
  open:      boolean;
  onClose:   () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

// Sample recent activities data
const SAMPLE_ACTIVITIES = [
  {
    id: 1,
    type: 'invoice',
    title: 'Invoice #INV-001 created',
    time: '2 minutes ago',
    user: 'John Doe',
    amount: '₹15,000',
    status: 'pending'
  },
  {
    id: 2,
    type: 'bill',
    title: 'Bill #BILL-002 paid',
    time: '1 hour ago',
    user: 'Sarah Smith',
    amount: '₹8,500',
    status: 'completed'
  },
  {
    id: 3,
    type: 'expense',
    title: 'Office supplies expense',
    time: '3 hours ago',
    user: 'Mike Johnson',
    amount: '₹2,300',
    status: 'pending'
  }
];

export default function RecentActivities({
  open,
  onClose,
  anchorRef,
}: RecentActivitiesProps) {
  useKey('Escape', onClose, open);

  type Pos = { top: number; left: number; arrowOffset: number };
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0, arrowOffset: 0 });

  const VERT_OFFSET   = 8;   // gap above panel
  const HORIZ_OFFSET  = 8;   // shy from button
  const ARROW_W       = 32;  // width of arrow
  const ARROW_H       = 12;  // height of arrow

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const btnRect = anchorRef.current.getBoundingClientRect();

    // panel left/top
    const panelLeft = btnRect.left + window.scrollX - HORIZ_OFFSET;
    const panelTop  = btnRect.bottom + window.scrollY + VERT_OFFSET;

    // arrow center under button
    const arrowCenter =
      btnRect.left +
      window.scrollX +
      btnRect.width / 2 -
      panelLeft -
      ARROW_W / 2;

    setPos({
      top: panelTop,
      left: panelLeft,
      arrowOffset: arrowCenter,
    });
  }, [open, anchorRef]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <DocumentTextIcon className="h-4 w-4 text-blue-500" />;
      case 'bill':
        return <ReceiptRefundIcon className="h-4 w-4 text-green-500" />;
      case 'expense':
        return <CreditCardIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-3 w-3 text-green-500" />;
      case 'pending':
        return <ExclamationTriangleIcon className="h-3 w-3 text-yellow-500" />;
      default:
        return <InformationCircleIcon className="h-3 w-3 text-gray-400" />;
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-20 bg-black/20" onClick={onClose} />

      {/* panel */}
      <div
        onClick={e => e.stopPropagation()}
        className="
          fixed z-30
          w-[90vw] max-w-[420px]
          bg-white shadow-2xl border border-gray-200
        "
        style={{ top: pos.top, left: pos.left }}
      >
        {/* — Sharp SVG arrow */}
        <svg
          width={ARROW_W}
          height={ARROW_H}
          viewBox={`0 0 ${ARROW_W} ${ARROW_H}`}
          className="absolute"
          style={{ top: `-${ARROW_H}px`, left: pos.arrowOffset }}
        >
          <defs>
            <filter
              id="arrow-shadow"
              x="-50%" y="-50%"
              width="200%" height="200%"
            >
              <feDropShadow
                dx="0" dy="2" stdDeviation="4"
                floodColor="rgba(0,0,0,0.1)"
              />
            </filter>
          </defs>

          {/* path: sharp triangle */}
          <path
            d={`
              M0,${ARROW_H}
              L${ARROW_W / 2},0
              L${ARROW_W},${ARROW_H}
              Z
            `}
            fill="white"
            stroke="rgb(229 231 235)"
            strokeWidth="1"
            filter="url(#arrow-shadow)"
          />
        </svg>

        {/* header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-white" />
              <h3 className="text-white font-semibold text-lg">Recent Activities</h3>
            </div>
            <div className="text-white/80 text-sm">
              {SAMPLE_ACTIVITIES.length} activities
            </div>
          </div>
        </div>

        {/* content */}
        <div className="p-6">
          {SAMPLE_ACTIVITIES.length > 0 ? (
            <div className="space-y-4">
              {SAMPLE_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(activity.status)}
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{activity.user}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CurrencyDollarIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-900">{activity.amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No recent activities yet</p>
              <p className="text-gray-400 text-xs mt-1">Your activities will appear here</p>
            </div>
          )}
        </div>

        {/* actions */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Create Invoice', icon: DocumentTextIcon, color: 'blue' },
              { label: 'Create Bill', icon: ReceiptRefundIcon, color: 'green' },
              { label: 'Create Expense', icon: CreditCardIcon, color: 'orange' }
            ].map(({ label, icon: Icon, color }) => (
              <button
                key={label}
                className={`
                  flex flex-col items-center gap-1 p-2 rounded-lg
                  hover:bg-white hover:shadow-sm transition-all duration-200
                  text-xs font-medium text-gray-700
                `}
              >
                <Icon className={`h-4 w-4 text-${color}-500`} />
                <span className="text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
