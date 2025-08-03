import { Schema, model, Types } from "mongoose";

const BankTxnSchema = new Schema({
  account_id: { type: Types.ObjectId, ref: "Account", required: true },
  amount: { type: Number, required: true },
  txn_date: { type: Date, required: true },
  reconciled: { type: Boolean, default: false },
  description: String
});

export default model("BankTransaction", BankTxnSchema);
