'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Camera, 
  CreditCard,
  LogOut,
  Activity,
  DollarSign,
  Eye,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

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
    const styles = {
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      approved: 'bg-red-500/20 text-red-400 border-red-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      rejected: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    const labels = {
      paid: 'Paid',
      approved: 'Unpaid',
      pending: 'Pending',
      rejected: 'Dismissed',
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-white/40 text-sm tracking-wider">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-transparent to-blue-950/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-medium text-white tracking-wider">Dashboard</h1>
                <p className="text-[10px] text-cyan-400/60 tracking-wider uppercase">High Beam Detection</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-white/80">{data?.vehicle.ownerName}</p>
                <p className="text-[10px] text-white/40 tracking-wider">{data?.vehicle.vehicleNumber}</p>
              </div>
              <motion.button 
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-white/20 transition-all text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Violations', value: data?.violationCount || 0, icon: Activity, color: 'cyan' },
              { label: 'Pending Fines', value: `₹${data?.pendingFines || 0}`, icon: AlertTriangle, color: 'red' },
              { label: 'Paid Fines', value: `₹${data?.paidFines || 0}`, icon: CheckCircle, color: 'green' },
              { label: 'Total Amount', value: `₹${data?.totalFines || 0}`, icon: DollarSign, color: 'yellow' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                  </div>
                </div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-xl font-light text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Violations List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-medium text-white tracking-wider">Violation History</h2>
              </div>
              <span className="text-[10px] text-white/40 uppercase tracking-wider">
                {data?.violations.length || 0} Records
              </span>
            </div>

            {!data?.violations.length ? (
              <div className="text-center py-16">
                <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
                <h3 className="text-lg text-white/80 mb-1">All Clear</h3>
                <p className="text-white/40 text-sm">No violations found for your vehicle.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.violations.map((violation, index) => (
                  <motion.div
                    key={violation._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="p-5 hover:bg-white/[0.02] transition-all group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Beam Intensity */}
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center relative overflow-hidden">
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-cyan-500/30"
                            style={{ height: `${violation.beamIntensity}%` }}
                          />
                          <span className="text-sm font-medium text-cyan-400 relative z-10">
                            {violation.beamIntensity}%
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            {getStatusBadge(violation.status)}
                            <span className="text-[10px] text-white/30 tracking-wider">
                              AI: {(violation.aiConfidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-white/80 text-sm mb-2">
                            High Beam Violation Detected
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/40">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(violation.detectionTimestamp), 'PPp')}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {violation.location.address}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pl-[72px] lg:pl-0">
                        <div className="text-right">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider">Fine</p>
                          <p className="text-lg font-light text-white">₹{violation.fineAmount}</p>
                        </div>

                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedViolation(violation);
                              setShowEvidence(true);
                            }}
                            className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-cyan-500/30 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          {violation.status === 'approved' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handlePayment(violation)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg font-medium text-sm transition-all"
                            >
                              <CreditCard className="w-4 h-4" />
                              Pay
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 mt-8">
          <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
            <p className="text-white/20 text-xs tracking-wider">AI Detection System</p>
            <a href="/" className="text-cyan-500/40 hover:text-cyan-400 text-xs tracking-wider transition-colors">
              Back to Home
            </a>
          </div>
        </footer>
      </div>

      {/* Evidence Modal */}
      <AnimatePresence>
        {showEvidence && selectedViolation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setShowEvidence(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-white tracking-wider">Evidence</h3>
                <button 
                  onClick={() => setShowEvidence(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="aspect-video bg-white/5 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {selectedViolation.evidenceImageUrl ? (
                  <img 
                    src={selectedViolation.evidenceImageUrl} 
                    alt="Violation Evidence"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-white/30">
                    <Camera className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Evidence not available</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Time', value: format(new Date(selectedViolation.detectionTimestamp), 'PPpp') },
                  { label: 'Intensity', value: `${selectedViolation.beamIntensity}%` },
                  { label: 'Location', value: selectedViolation.location.address },
                  { label: 'Camera', value: selectedViolation.cameraId },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-white/80 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
