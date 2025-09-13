import * as Svc from '../services/estimates.service.js';

export const createEstimate = async (req, res, next) => {
  try {
    // Handle both JSON and FormData requests
    let estimateData;
    if (req.body.quoteData) {
      // FormData request - parse the JSON string
      estimateData = JSON.parse(req.body.quoteData);
    } else {
      // Regular JSON request
      estimateData = req.body;
    }

    // Add files to estimate data if they exist
    if (req.files) {
      // Handle files field (array of files)
      if (req.files.files && req.files.files.length > 0) {
        estimateData.files = req.files.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
        }));
      }
      
      // Handle signature field (single file)
      if (req.files.signature && req.files.signature.length > 0) {
        const signatureFile = req.files.signature[0];
        estimateData.signatureFile = {
          filename: signatureFile.filename,
          originalName: signatureFile.originalname,
          path: signatureFile.path,
          size: signatureFile.size,
          mimetype: signatureFile.mimetype,
        };
      }
    }

    const est = await Svc.createEstimate(estimateData);
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

export const getAllEstimates = async (req, res, next) => {
  try {
    const estimates = await Svc.getAllEstimates();
    res.json(estimates);
  } catch (err) { next(err); }
};

export const updateEstimate = async (req, res, next) => {
  try {
    const est = await Svc.updateEstimate(req.params.id, req.body);
    if (!est) return res.status(404).json({ success: false, message: 'Estimate not found' });
    res.json({ success: true, data: est });
  } catch (err) { next(err); }
};

export const deleteEstimate = async (req, res, next) => {
  try {
    const est = await Svc.deleteEstimate(req.params.id);
    if (!est) return res.status(404).json({ success: false, message: 'Estimate not found' });
    res.json({ success: true, message: 'Estimate deleted successfully' });
  } catch (err) { next(err); }
};

export const updateEstimateStatus = async (req, res, next) => {
  try {
    const est = await Svc.updateEstimateStatus(req.params.id, req.body.status);
    if (!est) return res.status(404).json({ success: false, message: 'Estimate not found' });
    res.json({ success: true, data: est });
  } catch (err) { next(err); }
};

export const getNextEstimateNumber = async (req, res, next) => {
  try {
    const nextNumber = await Svc.getNextEstimateNumber();
    res.json({ success: true, data: nextNumber });
  } catch (err) { next(err); }
};
