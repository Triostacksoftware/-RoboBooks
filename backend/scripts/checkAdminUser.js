import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const admin = await Admin.findOne({ email: 'admin@robobooks.com' });
    
    if (admin) {
      console.log('✅ Admin user found!');
      console.log('📧 Email:', admin.email);
      console.log('👤 Role:', admin.role);
      console.log('🔐 Permissions:', admin.permissions);
      console.log('📅 Created:', admin.createdAt);
      console.log('🔄 Last Login:', admin.lastLogin);
      console.log('✅ Active:', admin.isActive);
      console.log('🔑 Has Password Hash:', !!admin.passwordHash);
    } else {
      console.log('❌ Admin user not found!');
      
      // Check if Admin collection exists and has any users
      const adminCount = await Admin.countDocuments();
      console.log('📊 Total admins in database:', adminCount);
      
      // List all admins
      const allAdmins = await Admin.find({}).select('email role isActive createdAt');
      console.log('👥 All admins:', allAdmins);
    }

  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
checkAdminUser();
