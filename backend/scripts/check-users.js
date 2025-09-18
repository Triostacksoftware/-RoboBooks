// Script to check existing users
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/robobooks');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkUsers = async () => {
  try {
    console.log('👥 Checking existing users...\n');

    const users = await User.find({});
    console.log(`📊 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email || 'N/A'}`);
      console.log(`   Company: ${user.companyName || 'N/A'}`);
      console.log(`   Phone: ${user.phone || 'N/A'}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Approval: ${user.approvalStatus}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ---');
    });

  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkUsers();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
  process.exit(0);
};

main();
