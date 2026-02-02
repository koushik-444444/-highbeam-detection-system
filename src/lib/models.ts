import mongoose, { Schema, Model } from 'mongoose';

// =====================
// VEHICLE SCHEMA
// =====================
const VehicleSchema = new Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  ownerName: {
    type: String,
    required: true,
    trim: true,
  },
  ownerDOBHash: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
}, {
  timestamps: true,
});

// =====================
// VIOLATION SCHEMA
// =====================
const ViolationSchema = new Schema({
  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
    index: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,
    index: true,
  },
  detectionTimestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, required: true },
  },
  beamIntensity: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  evidenceImageUrl: {
    type: String,
    required: true,
  },
  evidenceVideoUrl: {
    type: String,
  },
  fineAmount: {
    type: Number,
    required: true,
    default: 1000,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'pending',
    index: true,
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
  },
  aiConfidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  cameraId: {
    type: String,
    required: true,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
  },
  approvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// =====================
// PAYMENT SCHEMA
// =====================
const PaymentSchema = new Schema({
  violationId: {
    type: Schema.Types.ObjectId,
    ref: 'Violation',
    required: true,
    index: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'card', 'netbanking'],
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true,
  },
  receiptUrl: {
    type: String,
  },
  paidAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// =====================
// ADMIN SCHEMA
// =====================
const AdminSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'operator'],
    default: 'operator',
  },
  lastLogin: {
    type: Date,
  },
}, {
  timestamps: true,
});

// =====================
// MODEL EXPORTS
// =====================
// Prevent model recompilation in development
export const Vehicle: Model<any> = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
export const Violation: Model<any> = mongoose.models.Violation || mongoose.model('Violation', ViolationSchema);
export const Payment: Model<any> = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
export const Admin: Model<any> = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
