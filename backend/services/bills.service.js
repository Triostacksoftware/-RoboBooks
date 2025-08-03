import Bill from '../models/bill.model.js';

export const createBill    = (data) => Bill.create(data);
export const getBillById   = (id)   => Bill.findById(id);
