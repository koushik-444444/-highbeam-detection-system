'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { GlassCard, Button, Badge, AnimatedGrid } from '@/components/ui';
import { 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Camera, 
  CreditCard,
  LogOut,
  Shield,
  Activity,
  DollarSign,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

// Dynamically import 3D scene
const CarScene = dynamic(() => import('@/components/three/CarScene'), {
  ssr: false,
  loading: () => null,
});

interface Violation {
  _id: string;
  vehicleNumber: string;
  detectionTimestamp: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  beamIntensity: number;
  evidenceImageUrl: string;
  fineAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  aiConfidence: number;
  cameraId: string;
}

interface DashboardData {
  vehicle: {
    vehicleNumber: string;
    ownerName: string;
    phoneNumber?: string;
    email?: string;
  };
  violations: Violation[];
  totalFines: number;
  pendingFines: number;
  paidFines: number;
  violationCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/violations');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else if (response.status === 401) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handlePayment = (violation: Violation) => {
    router.push(`/payment?violationId=${violation._id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'approved':
        return <Badge variant="danger">Unpaid</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="info">Dismissed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative">
      {/* Background */}
      <div className="absolute inset-0 opacity-30">
        <Suspense fallback={null}>
          <CarScene />
        </Suspense>
      </div>
      <AnimatedGrid />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-black/30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Dashboard</h1>
                <p className="text-xs text-cyan-400">High Beam Detection System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-white font-medium">{data?.vehicle.ownerName}</p>
                <p className="text-xs text-white/60">{data?.vehicle.vehicleNumber}</p>
              </div>
              <Button variant="secondary" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Violations</p>
                    <p className="text-2xl font-bold text-white">{data?.violationCount || 0}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Pending Fines</p>
                    <p className="text-2xl font-bold text-white">₹{data?.pendingFines || 0}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Paid Fines</p>
                    <p className="text-2xl font-bold text-white">₹{data?.paidFines || 0}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Total Amount</p>
                    <p className="text-2xl font-bold text-white">₹{data?.totalFines || 0}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Violations List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-6" hover={false}>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                Violation History
              </h2>

              {!data?.violations.length ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">All Clear!</h3>
                  <p className="text-white/60">No violations found for your vehicle.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.violations.map((violation, index) => (
                    <motion.div
                      key={violation._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {/* Beam Intensity Indicator */}
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-red-500 flex items-center justify-center relative overflow-hidden">
                            <div 
                              className="absolute inset-0 bg-white/20"
                              style={{ 
                                clipPath: `inset(${100 - violation.beamIntensity}% 0 0 0)` 
                              }}
                            />
                            <span className="text-lg font-bold text-white relative z-10">
                              {violation.beamIntensity}%
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusBadge(violation.status)}
                              <span className="text-white/40 text-xs">
                                AI Confidence: {(violation.aiConfidence * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-white font-medium mb-1">
                              High Beam Violation Detected
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {format(new Date(violation.detectionTimestamp), 'PPp')}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {violation.location.address}
                              </span>
                              <span className="flex items-center gap-1">
                                <Camera className="w-4 h-4" />
                                {violation.cameraId}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-white/60 text-sm">Fine Amount</p>
                            <p className="text-2xl font-bold text-white">₹{violation.fineAmount}</p>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              variant="secondary"
                              className="text-xs"
                              onClick={() => {
                                setSelectedViolation(violation);
                                setShowEvidence(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Evidence
                            </Button>
                            {violation.status === 'approved' && (
                              <Button
                                className="text-xs"
                                onClick={() => handlePayment(violation)}
                              >
                                <CreditCard className="w-4 h-4 mr-1" />
                                Pay Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </main>
      </div>

      {/* Evidence Modal */}
      <AnimatePresence>
        {showEvidence && selectedViolation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowEvidence(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Evidence Image</h3>
              <div className="aspect-video bg-slate-800 rounded-xl mb-4 flex items-center justify-center">
                {selectedViolation.evidenceImageUrl ? (
                  <img 
                    src={selectedViolation.evidenceImageUrl} 
                    alt="Violation Evidence"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center text-white/40">
                    <Camera className="w-16 h-16 mx-auto mb-2" />
                    <p>Evidence image not available</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60">Detection Time</p>
                  <p className="text-white font-medium">
                    {format(new Date(selectedViolation.detectionTimestamp), 'PPpp')}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60">Beam Intensity</p>
                  <p className="text-white font-medium">{selectedViolation.beamIntensity}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60">Location</p>
                  <p className="text-white font-medium">{selectedViolation.location.address}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60">Camera ID</p>
                  <p className="text-white font-medium">{selectedViolation.cameraId}</p>
                </div>
              </div>
              <Button 
                variant="secondary" 
                className="w-full mt-4"
                onClick={() => setShowEvidence(false)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
