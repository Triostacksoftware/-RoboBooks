export const validStatusTransitions = {
  Draft: ['Sent', 'Cancelled'],
  Sent: ['Paid', 'Unpaid', 'Overdue', 'Partially Paid'],
  Unpaid: ['Paid', 'Overdue', 'Partially Paid', 'Sent'],
  Overdue: ['Paid', 'Unpaid', 'Partially Paid'],
  Paid: ['Unpaid', 'Partially Paid'],
  'Partially Paid': ['Paid', 'Unpaid'],
  Cancelled: []
};

export function canTransition(from, to) {
  return validStatusTransitions[from]?.includes(to);
}


