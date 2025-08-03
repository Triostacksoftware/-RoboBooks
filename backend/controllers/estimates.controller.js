import * as Svc from '../services/estimates.service.js';

export const createEstimate = async (req, res, next) => {
  try {
    const est = await Svc.createEstimate(req.body);
    res.status(201).json({ success: true, data: est });
  } catch (err) { next(err); }
};

export const getEstimateById = async (req, res, next) => {
  try {
    const est = await Svc.getEstimateById(req.params.id);
    if (!est) return res.status(404).json({ success: false, message: 'Estimate not found' });
    res.json({ success: true, data: est });
  } catch (err) { next(err); }
};
