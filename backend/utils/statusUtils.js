export const validStatusTransitions = {
  Draft: ['Sent', 'Canceled'],
  Sent: ['Paid', 'Overdue'],
  Overdue: ['Paid'],
  Paid: [],
  Canceled: []
};

export function canTransition(from, to) {
  return validStatusTransitions[from]?.includes(to);
}