import * as InvoiceService from '../services/invoiceservice.js';

export async function create(req, res) {
  try {
    const invoice = await InvoiceService.createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getAll(req, res) {
  try {
    const invoices = await InvoiceService.getAllInvoices();
    res.json(invoices);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getById(req, res) {
  try {
    const invoice = await InvoiceService.getInvoiceById(req.params.id);
    res.json(invoice);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const invoice = await InvoiceService.updateInvoice(req.params.id, req.body);
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const result = await InvoiceService.deleteInvoice(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const invoice = await InvoiceService.updateInvoiceStatus(req.params.id, req.body.status);
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}