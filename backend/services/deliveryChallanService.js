import DeliveryChallan from '../models/deliveryChallan.js';
import Customer from '../models/Customer.js';
import Item from '../models/Item.js';
import { logAction } from './auditTrailservice.js';
import { sendEmail } from './emailService.js';
import { generateDeliveryChallanPDF } from '../utils/pdfGenerator.js';

export async function createDeliveryChallan(data, userId) {
  try {
    // Validate customer exists
    const customer = await Customer.findById(data.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Validate items exist and have required fields
    if (!data.items || data.items.length === 0) {
      throw new Error('At least one item is required');
    }

    for (const item of data.items) {
      if (!item.itemId || !item.quantity || !item.uom) {
        throw new Error('Item ID, quantity, and UOM are required for all items');
      }
      if (item.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      // Fetch item details
      const itemDoc = await Item.findById(item.itemId);
      if (!itemDoc) {
        throw new Error(`Item with ID ${item.itemId} not found`);
      }
      
      // Set item name and HSN from the item document
      item.itemName = itemDoc.name;
      item.hsn = itemDoc.hsn || '';
      
      // Calculate amount if rate is provided
      if (item.rate) {
        item.amount = item.quantity * item.rate;
      }
    }

    // Generate challan number if not provided
    if (!data.challanNo) {
      const currentYear = new Date().getFullYear();
      const fy = `${currentYear}-${currentYear + 1}`;
      data.challanNo = await DeliveryChallan.getNextChallanNumber(
        data.orgId, 
        fy, 
        data.numberingSeries || 'DC'
      );
    }

    // Set financial year
    if (!data.fy) {
      const currentYear = new Date().getFullYear();
      data.fy = `${currentYear}-${currentYear + 1}`;
    }

    // Set customer details
    data.customerName = customer.displayName || `${customer.firstName} ${customer.lastName}`;
    data.customerEmail = customer.email;
    data.customerPhone = customer.mobile || customer.workPhone;

    // Create delivery challan
    const deliveryChallan = new DeliveryChallan({
      ...data,
      createdBy: userId,
      status: 'Draft'
    });

    await deliveryChallan.save();

    // Log the action
    logAction({
      user: userId,
      type: 'CREATE',
      entity: 'DeliveryChallan',
      entityId: deliveryChallan._id,
      message: 'Delivery Challan created',
    });

    return deliveryChallan;
  } catch (error) {
    throw new Error(`Failed to create delivery challan: ${error.message}`);
  }
}

export async function getAllDeliveryChallans(filters = {}, pagination = {}) {
  try {
    const {
      page = 1,
      limit = 25,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      dateFrom,
      dateTo,
      customerId
    } = pagination;

    // Build query
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (customerId) {
      query.customerId = customerId;
    }

    if (dateFrom || dateTo) {
      query.challanDate = {};
      if (dateFrom) query.challanDate.$gte = new Date(dateFrom);
      if (dateTo) query.challanDate.$lte = new Date(dateTo);
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { challanNo: searchRegex },
        { customerName: searchRegex },
        { referenceNo: searchRegex }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [deliveryChallans, total] = await Promise.all([
      DeliveryChallan.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('customerId', 'displayName email')
        .lean(),
      DeliveryChallan.countDocuments(query)
    ]);

    return {
      deliveryChallans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Failed to fetch delivery challans: ${error.message}`);
  }
}

export async function getDeliveryChallanById(id) {
  try {
    const deliveryChallan = await DeliveryChallan.findById(id)
      .populate('customerId', 'displayName email mobile workPhone billingAddress shippingAddress')
      .populate('items.itemId', 'name hsn description')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!deliveryChallan) {
      throw new Error('Delivery Challan not found');
    }

    return deliveryChallan;
  } catch (error) {
    throw new Error(`Failed to fetch delivery challan: ${error.message}`);
  }
}

export async function updateDeliveryChallan(id, data, userId) {
  try {
    const deliveryChallan = await DeliveryChallan.findById(id);
    if (!deliveryChallan) {
      throw new Error('Delivery Challan not found');
    }

    // Check if challan can be edited
    if (!deliveryChallan.canEdit) {
      throw new Error('Delivery Challan cannot be edited in current status');
    }

    // Validate items if provided
    if (data.items) {
      if (data.items.length === 0) {
        throw new Error('At least one item is required');
      }

      for (const item of data.items) {
        if (!item.itemId || !item.quantity || !item.uom) {
          throw new Error('Item ID, quantity, and UOM are required for all items');
        }
        if (item.quantity <= 0) {
          throw new Error('Quantity must be greater than 0');
        }

        // Fetch item details
        const itemDoc = await Item.findById(item.itemId);
        if (!itemDoc) {
          throw new Error(`Item with ID ${item.itemId} not found`);
        }
        
        item.itemName = itemDoc.name;
        item.hsn = itemDoc.hsn || '';
        
        if (item.rate) {
          item.amount = item.quantity * item.rate;
        }
      }
    }

    // Update fields
    Object.assign(deliveryChallan, data, { updatedBy: userId });
    await deliveryChallan.save();

    // Log the action
    logAction({
      user: userId,
      type: 'UPDATE',
      entity: 'DeliveryChallan',
      entityId: id,
      message: 'Delivery Challan updated',
    });

    return deliveryChallan;
  } catch (error) {
    throw new Error(`Failed to update delivery challan: ${error.message}`);
  }
}

export async function updateDeliveryChallanStatus(id, newStatus, userId, notes = '') {
  try {
    const deliveryChallan = await DeliveryChallan.findById(id);
    if (!deliveryChallan) {
      throw new Error('Delivery Challan not found');
    }

    // Check if status transition is valid
    if (!deliveryChallan.canTransitionTo(newStatus)) {
      throw new Error(`Invalid status transition from ${deliveryChallan.status} to ${newStatus}`);
    }

    // Update status
    deliveryChallan.status = newStatus;
    
    // Add audit entry
    deliveryChallan.addAuditEntry(newStatus, userId, notes);
    
    await deliveryChallan.save();

    // Log the action
    logAction({
      user: userId,
      type: 'STATUS_UPDATE',
      entity: 'DeliveryChallan',
      entityId: id,
      message: `Status updated to ${newStatus}`,
    });

    return deliveryChallan;
  } catch (error) {
    throw new Error(`Failed to update delivery challan status: ${error.message}`);
  }
}

export async function sendDeliveryChallanEmail(id, emailData, userId) {
  try {
    const deliveryChallan = await DeliveryChallan.findById(id)
      .populate('customerId', 'displayName email');
    
    if (!deliveryChallan) {
      throw new Error('Delivery Challan not found');
    }

    // Generate PDF
    const pdfBuffer = await generateDeliveryChallanPDF(deliveryChallan);
    
    // Send email with PDF attachment
    const emailResult = await sendEmail({
      to: emailData.to,
      cc: emailData.cc,
      subject: emailData.subject || `Delivery Challan ${deliveryChallan.challanNo}`,
      html: emailData.message || `Please find attached the Delivery Challan ${deliveryChallan.challanNo}`,
      attachments: [{
        filename: `DeliveryChallan-${deliveryChallan.challanNo}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });

    // Add email log
    deliveryChallan.addEmailLog({
      to: emailData.to,
      cc: emailData.cc,
      subject: emailData.subject || `Delivery Challan ${deliveryChallan.challanNo}`,
      message: emailData.message,
      messageId: emailResult.messageId || 'unknown',
      status: 'sent'
    });

    // Add audit entry
    deliveryChallan.addAuditEntry('Emailed', userId, `Email sent to ${emailData.to}`);
    
    await deliveryChallan.save();

    // Log the action
    logAction({
      user: userId,
      type: 'EMAIL_SENT',
      entity: 'DeliveryChallan',
      entityId: id,
      message: `Email sent to ${emailData.to}`,
    });

    return { success: true, messageId: emailResult.messageId };
  } catch (error) {
    throw new Error(`Failed to send delivery challan email: ${error.message}`);
  }
}

export async function duplicateDeliveryChallan(id, userId) {
  try {
    const original = await DeliveryChallan.findById(id);
    if (!original) {
      throw new Error('Delivery Challan not found');
    }

    // Generate new challan number
    const currentYear = new Date().getFullYear();
    const fy = `${currentYear}-${currentYear + 1}`;
    const newChallanNo = await DeliveryChallan.getNextChallanNumber(
      original.orgId, 
      fy, 
      original.numberingSeries
    );

    // Create duplicate with new data
    const duplicateData = {
      ...original.toObject(),
      _id: undefined,
      challanNo: newChallanNo,
      challanDate: new Date(),
      status: 'Draft',
      invoiceStatus: 'Not Invoiced',
      audit: [],
      emailLog: [],
      attachments: [],
      createdAt: undefined,
      updatedAt: undefined
    };

    const duplicate = new DeliveryChallan(duplicateData);
    duplicate.createdBy = userId;
    await duplicate.save();

    // Log the action
    logAction({
      user: userId,
      type: 'DUPLICATE',
      entity: 'DeliveryChallan',
      entityId: duplicate._id,
      message: `Duplicated from ${original.challanNo}`,
    });

    return duplicate;
  } catch (error) {
    throw new Error(`Failed to duplicate delivery challan: ${error.message}`);
  }
}

export async function deleteDeliveryChallan(id, userId) {
  try {
    const deliveryChallan = await DeliveryChallan.findById(id);
    if (!deliveryChallan) {
      throw new Error('Delivery Challan not found');
    }

    // Check if challan can be deleted
    if (!deliveryChallan.canDelete) {
      throw new Error('Delivery Challan cannot be deleted in current status');
    }

    await DeliveryChallan.findByIdAndDelete(id);

    // Log the action
    logAction({
      user: userId,
      type: 'DELETE',
      entity: 'DeliveryChallan',
      entityId: id,
      message: 'Delivery Challan deleted',
    });

    return { success: true, message: 'Delivery Challan deleted successfully' };
  } catch (error) {
    throw new Error(`Failed to delete delivery challan: ${error.message}`);
  }
}

export async function getNextChallanNumber(orgId, fy, numberingSeries = 'DC') {
  try {
    return await DeliveryChallan.getNextChallanNumber(orgId, fy, numberingSeries);
  } catch (error) {
    throw new Error(`Failed to get next challan number: ${error.message}`);
  }
}

export async function markDeliveryChallanReturned(id, returnData, userId) {
  try {
    const deliveryChallan = await DeliveryChallan.findById(id);
    if (!deliveryChallan) {
      throw new Error('Delivery Challan not found');
    }

    // Check if challan can be returned
    if (!['Open', 'Delivered'].includes(deliveryChallan.status)) {
      throw new Error('Delivery Challan cannot be returned in current status');
    }

    // Determine return status
    let newStatus = 'Returned';
    if (returnData.partialReturn && returnData.returnedItems) {
      newStatus = 'Partially Returned';
    }

    // Update status
    deliveryChallan.status = newStatus;
    
    // Add audit entry
    deliveryChallan.addAuditEntry(
      newStatus, 
      userId, 
      returnData.notes || 'Return processed'
    );
    
    await deliveryChallan.save();

    // Log the action
    logAction({
      user: userId,
      type: 'RETURN',
      entity: 'DeliveryChallan',
      entityId: id,
      message: `Marked as ${newStatus}`,
    });

    return deliveryChallan;
  } catch (error) {
    throw new Error(`Failed to mark delivery challan as returned: ${error.message}`);
  }
}
