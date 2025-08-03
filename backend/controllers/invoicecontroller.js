import * as InvoiceService from '../services/invoiceservice.js';

export async function create(req, res) {
  try {
    const invoice = await InvoiceService.createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const invoice = await InvoiceService.updateInvoiceStatus(req.params.id, req.body.status);
    res.json(invoice);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}