import mongoose from 'mongoose';
import BankTransaction from './models/BankTransaction.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkTransactions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const transactions = await BankTransaction.find({}).limit(5);
    console.log('Recent transactions:');
    transactions.forEach((txn, index) => {
      console.log(`Transaction ${index + 1}:`);
      console.log(`  Description: ${txn.description}`);
      console.log(`  Amount: ${txn.amount}`);
      console.log(`  Type: ${txn.type}`);
      console.log(`  Withdrawals: ${txn.withdrawals}`);
      console.log(`  Deposits: ${txn.deposits}`);
      console.log(`  Import Source: ${txn.importSource}`);
      console.log(`  Original Data: ${JSON.stringify(txn.originalData)}`);
      console.log('---');
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTransactions();
