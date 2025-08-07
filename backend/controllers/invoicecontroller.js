import * as InvoiceService from "../services/invoiceservice.js";

export async function create(req, res) {
  try {
    const invoice = await InvoiceService.createInvoice(req.body);
    res.status(201).json({
      success: true,
      data: invoice,
      message: "Invoice created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getAll(req, res) {
  try {
    const invoices = await InvoiceService.getAllInvoices();
    res.status(200).json({
      success: true,
      data: invoices,
      message: "Invoices retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getById(req, res) {
  try {
    const invoice = await InvoiceService.getInvoiceById(req.params.id);
    res.status(200).json({
      success: true,
      data: invoice,
      message: "Invoice retrieved successfully",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
}

export async function update(req, res) {
  try {
    const invoice = await InvoiceService.updateInvoice(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: invoice,
      message: "Invoice updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function remove(req, res) {
  try {
    const result = await InvoiceService.deleteInvoice(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function updateStatus(req, res) {
  try {
    const invoice = await InvoiceService.updateInvoiceStatus(
      req.params.id,
      req.body.status
    );
    res.status(200).json({
      success: true,
      data: invoice,
      message: "Invoice status updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

export async function sendInvoiceEmail(req, res) {
  try {
    const { id } = req.params;
    const { recipientEmail } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        error: "Recipient email is required",
      });
    }

    // Get invoice data
    const invoice = await InvoiceService.getInvoiceById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: "Invoice not found",
      });
    }

    // Import email service
    const { sendInvoiceEmail } = await import("../services/emailService.js");

    // Send email
    const result = await sendInvoiceEmail(invoice, recipientEmail);

    // Try to update invoice status to "Sent" if email is sent successfully
    if (result.success) {
      try {
        await InvoiceService.updateInvoiceStatus(id, "Sent");
      } catch (statusError) {
        // If status update fails, log it but don't fail the email sending
        console.warn(
          "Could not update invoice status to 'Sent':",
          statusError.message
        );
        // The email was sent successfully, so we still return success
      }
    }

    res.status(200).json({
      success: true,
      data: result,
      message: "Invoice sent successfully",
    });
  } catch (error) {
    console.error("Error in sendInvoiceEmail controller:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export async function getNextInvoiceNumber(req, res) {
  try {
    const nextInvoiceNumber = await InvoiceService.getNextInvoiceNumber();
    res.status(200).json({
      success: true,
      data: { invoiceNumber: nextInvoiceNumber },
      message: "Next invoice number retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
