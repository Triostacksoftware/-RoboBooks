import { Schema, model } from "mongoose";

const AccountSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },       // e.g. Asset, Liability…
  balance: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

export default model("Account", AccountSchema);
