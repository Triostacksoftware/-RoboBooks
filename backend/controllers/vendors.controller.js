import * as Svc from '../services/vendors.service.js';

export const createVendor = async (req, res, next) => {
  try {
    const v = await Svc.createVendor(req.body);
    res.status(201).json({ success: true, data: v });
  } catch (err) { next(err); }
};

export const listVendors = async (_req, res, next) => {
  try {
    const items = await Svc.listVendors();
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

export const getVendorById = async (req, res, next) => {
  try {
    const v = await Svc.getVendorById(req.params.id);
    if (!v) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, data: v });
  } catch (err) { next(err); }
};

export const updateVendor = async (req, res, next) => {
  try {
    const v = await Svc.updateVendor(req.params.id, req.body);
    if (!v) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, data: v });
  } catch (err) { next(err); }
};

export const deleteVendor = async (req, res, next) => {
  try {
    const v = await Svc.deleteVendor(req.params.id);
    if (!v) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, message: 'Vendor deleted successfully' });
  } catch (err) { next(err); }
};

export const searchVendors = async (req, res, next) => {
  try {
    const { query } = req.query;
    const vendors = await Svc.searchVendors(query);
    res.json({ success: true, data: vendors });
  } catch (err) { next(err); }
};


