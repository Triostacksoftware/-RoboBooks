import Vendor from '../models/vendor.model.js';

export const createVendor   = (data) => Vendor.create(data);
export const getVendorById  = (id)   => Vendor.findById(id);
export const listVendors    = ()     => Vendor.find().sort({ createdAt: -1 });
