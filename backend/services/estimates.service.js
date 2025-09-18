import Estimate from '../models/estimate.model.js';

export const createEstimate = async (data) => {
  try {
    // Generate quote number if not provided or if provided number already exists
    if (!data.quoteNumber) {
      data.quoteNumber = await getNextEstimateNumber();
    } else {
      // Check if the provided quote number already exists
      const existingQuote = await Estimate.findOne({ quoteNumber: data.quoteNumber });
      if (existingQuote) {
        // If it exists, generate a new unique number
        data.quoteNumber = await getNextEstimateNumber();
      }
    }
    
    // Set default values
    if (!data.quoteDate) {
      data.quoteDate = new Date();
    }
    
    if (!data.status) {
      data.status = 'draft';
    }
    
    // Ensure items have required fields
    if (data.items && data.items.length > 0) {
      data.items = data.items.map(item => ({
        ...item,
        amount: item.amount || (item.quantity * item.rate),
        taxAmount: item.taxAmount || 0,
        cgst: item.cgst || 0,
        sgst: item.sgst || 0,
        igst: item.igst || 0
      }));
    }
    
    // Calculate totals if not provided
    if (data.items && data.items.length > 0) {
      if (data.subTotal === undefined || data.subTotal === 0) {
        data.subTotal = data.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      }
      
      if (data.total === undefined || data.total === 0) {
        let total = data.subTotal;
        
        // Apply discount
        if (data.discountAmount > 0) {
          total -= data.discountAmount;
        }
        
        // Apply GST
        if (data.cgstTotal > 0) total += data.cgstTotal;
        if (data.sgstTotal > 0) total += data.sgstTotal;
        if (data.igstTotal > 0) total += data.igstTotal;
        
        // Apply TDS/TCS
        if (data.additionalTaxAmount > 0) {
          total += data.additionalTaxAmount;
        }
        
        // Apply adjustment
        if (data.adjustment) {
          total += data.adjustment;
        }
        
        data.total = total;
      }
    }
    
    const estimate = await Estimate.create(data);
    return estimate;
  } catch (error) {
    console.error('Error creating estimate:', error);
    throw error;
  }
};

export const getEstimateById = (id) => Estimate.findById(id);
export const getAllEstimates = () => Estimate.find().sort({ createdAt: -1 });
export const updateEstimate = (id, data) => Estimate.findByIdAndUpdate(id, data, { new: true });
export const deleteEstimate = (id) => Estimate.findByIdAndDelete(id);
export const updateEstimateStatus = (id, status) => Estimate.findByIdAndUpdate(id, { status }, { new: true });

export const getNextEstimateNumber = async () => {
  try {
    const lastEstimate = await Estimate.findOne().sort({ quoteNumber: -1 });
    if (!lastEstimate) return "QT-000001";
    
    const lastNumber = lastEstimate.quoteNumber;
    const match = lastNumber.match(/QT-(\d+)/);
    if (!match) return "QT-000001";
    
    const nextNumber = parseInt(match[1]) + 1;
    return `QT-${nextNumber.toString().padStart(6, '0')}`;
  } catch (error) {
    console.error('Error generating quote number:', error);
    return "QT-000001";
  }
};


