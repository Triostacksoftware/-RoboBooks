import Vendor from '../models/vendor.model.js';

export const createVendor = (data) => Vendor.create(data);

export const listVendors = () => Vendor.find().sort({ createdAt: -1 });

export const getVendorById = (id) => Vendor.findById(id);

export const updateVendor = (id, data) => Vendor.findByIdAndUpdate(id, data, { new: true });

export const deleteVendor = (id) => Vendor.findByIdAndDelete(id);

export const searchVendors = (query) => {
  if (!query) return Vendor.find().sort({ createdAt: -1 });
  
  return Vendor.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { companyName: { $regex: query, $options: 'i' } },
      { displayName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { gstin: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } }
    ]
  }).sort({ createdAt: -1 });
};


