/**
 * Database Seed Script
 * Run with: npx ts-node --compiler-options '{"module":"CommonJS"}' src/scripts/seed.ts
 * Or add to package.json scripts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/highbeam';

// Schemas (inline for script portability)
const VehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  ownerName: { type: String, required: true },
  ownerDOBHash: { type: String, required: true },
  phoneNumber: String,
  email: String,
}, { timestamps: true });

const ViolationSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  vehicleNumber: { type: String, required: true },
  detectionTimestamp: { type: Date, default: Date.now },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
  },
  beamIntensity: { type: Number, required: true },
  evidenceImageUrl: String,
  evidenceVideoUrl: String,
  fineAmount: { type: Number, default: 1000 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
  aiConfidence: { type: Number, required: true },
  cameraId: String,
}, { timestamps: true });

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'admin', 'operator'], default: 'operator' },
}, { timestamps: true });

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const Vehicle = mongoose.model('Vehicle', VehicleSchema);
    const Violation = mongoose.model('Violation', ViolationSchema);
    const Admin = mongoose.model('Admin', AdminSchema);

    // Clear existing data
    console.log('Clearing existing data...');
    await Vehicle.deleteMany({});
    await Violation.deleteMany({});
    await Admin.deleteMany({});

    // Create demo vehicles
    console.log('Creating demo vehicles...');
    const dobHash = await bcrypt.hash('1990-01-15', 10);
    
    const vehicles = await Vehicle.insertMany([
      {
        vehicleNumber: 'MH12AB1234',
        ownerName: 'Rajesh Kumar',
        ownerDOBHash: dobHash,
        phoneNumber: '+91 9876543210',
        email: 'rajesh@example.com',
      },
      {
        vehicleNumber: 'MH14CD5678',
        ownerName: 'Priya Sharma',
        ownerDOBHash: await bcrypt.hash('1985-06-20', 10),
        phoneNumber: '+91 9876543211',
        email: 'priya@example.com',
      },
      {
        vehicleNumber: 'MH01EF9012',
        ownerName: 'Amit Patel',
        ownerDOBHash: await bcrypt.hash('1992-03-10', 10),
        phoneNumber: '+91 9876543212',
        email: 'amit@example.com',
      },
    ]);

    console.log(`Created ${vehicles.length} vehicles`);

    // Create demo violations
    console.log('Creating demo violations...');
    const violations = await Violation.insertMany([
      {
        vehicleId: vehicles[0]._id,
        vehicleNumber: 'MH12AB1234',
        detectionTimestamp: new Date(),
        location: {
          latitude: 19.0760,
          longitude: 72.8777,
          address: 'Marine Drive, Mumbai',
        },
        beamIntensity: 85,
        evidenceImageUrl: '/images/violation-1.jpg',
        fineAmount: 1500,
        status: 'approved',
        aiConfidence: 0.95,
        cameraId: 'CAM-001',
      },
      {
        vehicleId: vehicles[0]._id,
        vehicleNumber: 'MH12AB1234',
        detectionTimestamp: new Date(Date.now() - 86400000),
        location: {
          latitude: 19.0596,
          longitude: 72.8295,
          address: 'Bandra Worli Sea Link',
        },
        beamIntensity: 72,
        evidenceImageUrl: '/images/violation-2.jpg',
        fineAmount: 1000,
        status: 'paid',
        aiConfidence: 0.88,
        cameraId: 'CAM-003',
      },
      {
        vehicleId: vehicles[1]._id,
        vehicleNumber: 'MH14CD5678',
        detectionTimestamp: new Date(Date.now() - 3600000),
        location: {
          latitude: 19.0728,
          longitude: 72.8826,
          address: 'Eastern Express Highway',
        },
        beamIntensity: 92,
        evidenceImageUrl: '/images/violation-3.jpg',
        fineAmount: 2000,
        status: 'pending',
        aiConfidence: 0.97,
        cameraId: 'CAM-007',
      },
      {
        vehicleId: vehicles[2]._id,
        vehicleNumber: 'MH01EF9012',
        detectionTimestamp: new Date(Date.now() - 7200000),
        location: {
          latitude: 19.1136,
          longitude: 72.8697,
          address: 'Western Express Highway',
        },
        beamIntensity: 78,
        evidenceImageUrl: '/images/violation-4.jpg',
        fineAmount: 1500,
        status: 'approved',
        aiConfidence: 0.91,
        cameraId: 'CAM-012',
      },
    ]);

    console.log(`Created ${violations.length} violations`);

    // Create demo admin
    console.log('Creating demo admin...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await Admin.create({
      email: 'admin@highbeam.gov',
      passwordHash: adminPasswordHash,
      name: 'System Administrator',
      role: 'super_admin',
    });

    console.log('Demo admin created: admin@highbeam.gov / admin123');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Credentials:');
    console.log('Vehicle Login: MH12AB1234 / DOB: 1990-01-15');
    console.log('Admin Login: admin@highbeam.gov / admin123');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
