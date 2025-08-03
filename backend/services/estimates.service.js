import Estimate from '../models/estimate.model.js';

export const createEstimate    = (data) => Estimate.create(data);
export const getEstimateById   = (id)   => Estimate.findById(id);
