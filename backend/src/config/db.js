import mongoose from 'mongoose';
import User from '../models/User.js';

const seedInitialUsers = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding initial demo users into database...');
      await User.create([
        {
          name: 'System Admin',
          email: 'admin@healthcare.com',
          password: 'password123',
          role: 'admin',
          isApproved: true,
        },
        {
          name: 'Dr. Sarah Smith',
          email: 'doctor@healthcare.com',
          password: 'password123',
          role: 'doctor',
          specialization: 'Cardiology',
          experience: 10,
          consultationFee: 150,
          isApproved: true,
          availability: [
            { day: 'Monday', startTime: '09:00', endTime: '17:00' },
            { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
            { day: 'Friday', startTime: '09:00', endTime: '17:00' },
          ],
        },
        {
          name: 'John Doe',
          email: 'patient@healthcare.com',
          password: 'password123',
          role: 'patient',
          isApproved: true,
        },
      ]);
      console.log('✅ Demo users created successfully! (password: password123)');
    }
  } catch (err) {
    console.error('Error seeding initial users:', err.message);
  }
};

export const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/doctorApp';
  const fallbackUri = 'mongodb://127.0.0.1:27017/doctorApp';

  try {
    console.log(`Attempting MongoDB connection... (URI: ${primaryUri.replace(/:([^:@]+)@/, ":****@")})`);
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedInitialUsers();
  } catch (error) {
    console.error(`⚠️ Error connecting to primary MongoDB (${primaryUri}): ${error.message}`);
    
    if (primaryUri !== fallbackUri) {
      try {
        console.log(`🔄 Attempting fallback connection to local MongoDB: ${fallbackUri}`);
        const conn = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
        });
        console.log(`✅ Fallback MongoDB Connected: ${conn.connection.host}`);
        await seedInitialUsers();
        return;
      } catch (fallbackError) {
        console.error(`❌ Fallback MongoDB connection failed: ${fallbackError.message}`);
      }
    }

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

