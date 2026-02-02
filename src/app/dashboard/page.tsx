'use client';

// Force dynamic rendering to use context providers
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
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
  ChevronRight,
  Download,
  List,
  GitBranch,
  Keyboard,
  Radar
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage, LanguageSwitcher } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/contexts/ThemeContext';
import { useKeyboardShortcuts, KeyboardShortcutsModal } from '@/hooks/useKeyboardShortcuts';
import { SoundToggle } from '@/hooks/useSound';
import { DashboardSkeleton } from '@/components/Skeleton';
import ViolationTimeline from '@/components/ViolationTimeline';
import EvidenceScanner from '@/components/EvidenceScanner';
import ViolationRadar from '@/components/ViolationRadar';
import CarScene from '@/components/three/CarScene';
import { generateChallanPDF } from '@/lib/pdfGenerator';

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
  const { success, error: showError } = useToast();
  const { t } = useLanguage();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [showEvidence, setShowEvidence] = useState(false);
  const [evidenceMode, setEvidenceMode] = useState<'2d' | '3d'>('2d');
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'radar'>('list');

  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    onEscape: () => {
      setShowEvidence(false);
      setSelectedViolation(null);
    },
    onLogout: handleLogout,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
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
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    success('Logged out successfully');
    router.push('/');
  }

  function handlePayment(violation: Violation) {
    router.push(`/payment?violationId=${violation._id}`);
  }

  async function handleDownloadChallan(violation: Violation) {
    try {
      await generateChallanPDF(violation);
      success('Challan generated successfully');
    } catch (err) {
      showError('Failed to generate challan');
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      approved: 'bg-red-500/20 text-red-400 border-red-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      rejected: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    const labels = {
      paid: t('paid'),
      approved: t('unpaid'),
      pending: t('pending'),
      rejected: t('dismissed'),
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-transparent to-blue-950/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-medium text-white tracking-wider">{t('dashboard')}</h1>
                <p className="text-[10px] text-cyan-400/60 tracking-wider uppercase">{t('detectionSystem')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-white/80">{data?.vehicle.ownerName}</p>
                <p className="text-[10px] text-white/40 tracking-wider">{data?.vehicle.vehicleNumber}</p>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-1">
                <LanguageSwitcher />
                <ThemeToggle />
                <SoundToggle />
                <motion.button
                  onClick={() => setShowHelp(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all hidden sm:flex"
                  title="Keyboard shortcuts (?)"
                >
                  <Keyboard className="w-4 h-4 text-white/40" />
                </motion.button>
              </div>
              
              <motion.button 
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-white/20 transition-all text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: t('totalViolations'), value: data?.violationCount || 0, icon: Activity, color: 'cyan' },
              { label: t('pendingFines'), value: `₹${data?.pendingFines || 0}`, icon: AlertTriangle, color: 'red' },
              { label: t('paidFines'), value: `₹${data?.paidFines || 0}`, icon: CheckCircle, color: 'green' },
              { label: t('totalAmount'), value: `₹${data?.totalFines || 0}`, icon: DollarSign, color: 'yellow' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-4 sm:p-5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                    <stat.icon className={`w-4 sm:w-5 h-4 sm:h-5 text-${stat.color}-400`} />
                  </div>
                </div>
                <p className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-lg sm:text-xl font-light text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-medium text-white tracking-wider">{t('violationHistory')}</h2>
              <span className="text-[10px] text-white/40 uppercase tracking-wider ml-2">
                {data?.violations.length || 0} {t('records')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/40 hover:text-white'
                }`}
                title={t('listView')}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'timeline' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/40 hover:text-white'
                }`}
                title={t('timelineView')}
              >
                <GitBranch className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('radar')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'radar' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/40 hover:text-white'
                }`}
                title="Radar View"
              >
                <Radar className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Violations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden"
          >
            {viewMode === 'radar' ? (
              <div className="p-8 sm:p-12">
                <div className="text-center mb-8">
                  <h3 className="text-lg text-white font-light tracking-widest uppercase">Geospatial Detection Radar</h3>
                  <p className="text-[10px] text-cyan-400/60 uppercase tracking-widest mt-1">Real-time localized violation mapping</p>
                </div>
                <ViolationRadar violations={data?.violations || []} />
              </div>
            ) : viewMode === 'timeline' ? (
              <div className="p-6">
                <ViolationTimeline
                  violations={data?.violations || []}
                  onPay={handlePayment}
                />
              </div>
            ) : (
              <>
                {!data?.violations.length ? (
                  <div className="text-center py-16">
                    <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
                    <h3 className="text-lg text-white/80 mb-1">{t('allClear')}</h3>
                    <p className="text-white/40 text-sm">{t('noViolationsFound')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {data.violations.map((violation, index) => (
                      <motion.div
                        key={violation._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="p-4 sm:p-5 hover:bg-white/[0.02] transition-all group"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-3 sm:gap-4">
                            {/* Beam Intensity */}
                            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                              <div 
                                className="absolute bottom-0 left-0 right-0 bg-cyan-500/30"
                                style={{ height: `${violation.beamIntensity}%` }}
                              />
                              <span className="text-xs sm:text-sm font-medium text-cyan-400 relative z-10">
                                {violation.beamIntensity}%
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                {getStatusBadge(violation.status)}
                                <span className="text-[10px] text-white/30 tracking-wider">
                                  AI: {(violation.aiConfidence * 100).toFixed(0)}%
                                </span>
                              </div>
                              <p className="text-white/80 text-sm mb-2">
                                {t('highBeamViolation')}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-white/40">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(violation.detectionTimestamp), 'PPp')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate max-w-[150px] sm:max-w-none">{violation.location.address}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 sm:gap-4 pl-[60px] lg:pl-0">
                            <div className="text-right">
                              <p className="text-[10px] text-white/40 uppercase tracking-wider">{t('fine')}</p>
                              <p className="text-lg font-light text-white">₹{violation.fineAmount}</p>
                            </div>

                            <div className="flex gap-1 sm:gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDownloadChallan(violation)}
                                className="p-2 sm:p-2.5 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-cyan-500/30 transition-all"
                                title={t('downloadChallan')}
                              >
                                <Download className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setSelectedViolation(violation);
                                  setShowEvidence(true);
                                }}
                                className="p-2 sm:p-2.5 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:border-cyan-500/30 transition-all"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              {violation.status === 'approved' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handlePayment(violation)}
                                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg font-medium text-sm transition-all"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  <span className="hidden sm:inline">{t('pay')}</span>
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 mt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <p className="text-white/20 text-xs tracking-wider">{t('aiDetection')}</p>
            <a href="/" className="text-cyan-500/40 hover:text-cyan-400 text-xs tracking-wider transition-colors">
              {t('backToHome')}
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
                <div className="flex bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setEvidenceMode('2d')}
                    className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-md transition-all ${
                      evidenceMode === '2d' ? 'bg-cyan-500 text-black font-medium' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    X-Ray View
                  </button>
                  <button
                    onClick={() => setEvidenceMode('3d')}
                    className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-md transition-all ${
                      evidenceMode === '3d' ? 'bg-cyan-500 text-black font-medium' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    3D Replay
                  </button>
                </div>
                <button 
                  onClick={() => {
                    setShowEvidence(false);
                    setEvidenceMode('2d');
                  }}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                {evidenceMode === '2d' ? (
                  <EvidenceScanner 
                    imageUrl={selectedViolation.evidenceImageUrl}
                    intensity={selectedViolation.beamIntensity}
                    confidence={selectedViolation.aiConfidence}
                  />
                ) : (
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                    <CarScene 
                      violationIntensity={selectedViolation.beamIntensity}
                      focusSide={selectedViolation.beamIntensity > 80 ? 'both' : 'left'} 
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-cyan-500/30">
                        <span className="text-[9px] text-cyan-400 font-mono uppercase tracking-widest">3D Reconstruction</span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 text-right">
                      <p className="text-[8px] text-white/20 font-mono uppercase">Simulation Mode</p>
                      <p className="text-[10px] text-white/60 font-mono uppercase">V-Intensity: {selectedViolation.beamIntensity}%</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: t('time'), value: format(new Date(selectedViolation.detectionTimestamp), 'PPpp') },
                  { label: t('intensity'), value: `${selectedViolation.beamIntensity}%` },
                  { label: t('location'), value: selectedViolation.location.address },
                  { label: t('camera'), value: selectedViolation.cameraId },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-white/80 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Download Challan Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDownloadChallan(selectedViolation)}
                className="w-full mt-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t('downloadChallan')}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
