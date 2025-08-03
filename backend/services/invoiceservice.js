import Invoice from '../models/invoice.model.js';
import InvoiceItem from '../models/invoiceItem.model.js';
import { calculateGST, calculateTotal } from './gst.service.js';
import { canTransition } from '../utils/statusUtils.js';
import { logAction } from './audit.service.js';

export async function createInvoice(data) {
  const gst_data = calculateGST(data.items);
  const total = calculateTotal(data.items);
  const invoice = await Invoice.create({ ...data, gst_data, total });
  await Promise.all(
    data.items.map(item => InvoiceItem.create({ ...item, invoice_id: invoice._id }))
  );
  logAction({ user: 'system', type: 'CREATE', entity: 'Invoice', entityId: invoice._id, message: 'Invoice created' });
  return invoice;
}

export async function updateInvoiceStatus(id, status) {
  const invoice = await Invoice.findById(id);
  if (!invoice) throw new Error('Invoice not found');
  if (!canTransition(invoice.status, status)) throw new Error('Invalid status');
  invoice.status = status;
  await invoice.save();
  logAction({ user: 'system', type: 'UPDATE', entity: 'Invoice', entityId: id, message: `Status updated to ${status}` });
  return invoice;
}