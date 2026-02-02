// Type definitions for the High Beam Detection System

export interface Vehicle {
  _id: string;
  vehicleNumber: string;
  ownerName: string;
  ownerDOB: string; // Stored as hashed value for security
  phoneNumber?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Violation {
  _id: string;
  vehicleId: string;
  vehicleNumber: string;
  detectionTimestamp: Date;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  beamIntensity: number; // 0-100 scale
  evidenceImageUrl: string;
  evidenceVideoUrl?: string;
  fineAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  paymentId?: string;
  aiConfidence: number; // 0-1 scale
  cameraId: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  _id: string;
  violationId: string;
  vehicleNumber: string;
  amount: number;
  currency: string;
  paymentMethod: 'upi' | 'card' | 'netbanking';
  transactionId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  receiptUrl?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'super_admin' | 'admin' | 'operator';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIDetectionPayload {
  vehicleNumber: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  beamIntensity: number;
  imageBase64: string;
  videoUrl?: string;
  confidence: number;
  cameraId: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  vehicle?: Partial<Vehicle>;
  violations?: Violation[];
}

export interface DashboardData {
  vehicle: Partial<Vehicle>;
  violations: Violation[];
  totalFines: number;
  pendingFines: number;
  paidFines: number;
}
