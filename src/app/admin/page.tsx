'use client';

// Force dynamic rendering to use context providers
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Camera,
  AlertTriangle,
  DollarSign,
  Activity,
  LogOut,
  Eye,
  Search,
  Download,
  BarChart3,
  Table,
  Filter,
  X,
  Keyboard,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage, LanguageSwitcher } from '@/contexts/LanguageContext';
import { ThemeToggle } from '@/contexts/ThemeContext';
import { useKeyboardShortcuts, KeyboardShortcutsModal } from '@/hooks/useKeyboardShortcuts';
import { SoundToggle } from '@/hooks/useSound';
import { AdminSkeleton } from '@/components/Skeleton';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import { exportToCSV } from '@/lib/exportData';

interface Violation {
  _id: string;
  vehicleNumber: string;
  detectionTimestamp: string;
  location: { address: string };
  beamIntensity: number;
  fineAmount: number;
  status: string;
  aiConfidence: number;
  cameraId: string;
  evidenceImageUrl: string;
}

interface Stats {
  totalViolations: number;
  pendingApproval: number;
  approved: number;
  totalRevenue: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { success, error: showError, warning } = useToast();
  const { t } = useLanguage();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  const [violations, setViolations] = useState<Violation[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalViolations: 0,
    pendingApproval: 0,
    approved: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'analytics'>('table');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Enhanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minFine, setMinFine] = useState('');
  const [maxFine, setMaxFine] = useState('');

  const { showHelp, setShowHelp } = useKeyboardShortcuts({
    onEscape: () => {
      setSelectedViolation(null);
      setShowFilters(false);
    },
    onSearch: () => searchInputRef.current?.focus(),
    onLogout: () => setIsAuthenticated(false),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    if (email === 'admin@highbeam.gov' && password === 'admin123') {
      setTimeout(() => {
        setIsAuthenticated(true);
        setLoginLoading(false);
        success('Login successful');
        loadViolations();
      }, 1000);
    } else {
      setLoginError(t('invalidCredentials'));
      showError(t('invalidCredentials'));
      setLoginLoading(false);
    }
  };

  const loadViolations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/violations');
      const data = await response.json();
      if (data.success) {
        setViolations(data.violations || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      // Demo data
      setViolations([
        {
          _id: '1',
          vehicleNumber: 'MH12AB1234',
          detectionTimestamp: new Date().toISOString(),
          location: { address: 'Marine Drive, Mumbai' },
          beamIntensity: 85,
          fineAmount: 1500,
          status: 'pending',
          aiConfidence: 0.95,
          cameraId: 'CAM-001',
          evidenceImageUrl: '',
        },
        {
          _id: '2',
          vehicleNumber: 'MH14CD5678',
          detectionTimestamp: new Date(Date.now() - 3600000).toISOString(),
          location: { address: 'Bandra Worli Sea Link' },
          beamIntensity: 72,
          fineAmount: 1000,
          status: 'approved',
          aiConfidence: 0.88,
          cameraId: 'CAM-003',
          evidenceImageUrl: '',
        },
        {
          _id: '3',
          vehicleNumber: 'MH01EF9012',
          detectionTimestamp: new Date(Date.now() - 7200000).toISOString(),
          location: { address: 'Eastern Express Highway' },
          beamIntensity: 92,
          fineAmount: 2000,
          status: 'pending',
          aiConfidence: 0.97,
          cameraId: 'CAM-007',
          evidenceImageUrl: '',
        },
        {
          _id: '4',
          vehicleNumber: 'KA05GH3456',
          detectionTimestamp: new Date(Date.now() - 86400000).toISOString(),
          location: { address: 'MG Road, Bangalore' },
          beamIntensity: 78,
          fineAmount: 1200,
          status: 'pending',
          aiConfidence: 0.91,
          cameraId: 'CAM-012',
          evidenceImageUrl: '',
        },
        {
          _id: '5',
          vehicleNumber: 'DL04IJ7890',
          detectionTimestamp: new Date(Date.now() - 172800000).toISOString(),
          location: { address: 'Connaught Place, Delhi' },
          beamIntensity: 88,
          fineAmount: 1800,
          status: 'rejected',
          aiConfidence: 0.72,
          cameraId: 'CAM-025',
          evidenceImageUrl: '',
        },
      ]);
      setStats({
        totalViolations: 156,
        pendingApproval: 23,
        approved: 89,
        totalRevenue: 178500,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (violationId: string) => {
    setViolations(prev => prev.map(v => 
      v._id === violationId ? { ...v, status: 'approved' } : v
    ));
    success('Violation approved');
  };

  const handleReject = async (violationId: string) => {
    setViolations(prev => prev.map(v => 
      v._id === violationId ? { ...v, status: 'rejected' } : v
    ));
    success('Violation rejected');
  };

  const handleBulkApprove = () => {
    setViolations(prev => prev.map(v => 
      selectedIds.has(v._id) && v.status === 'pending' ? { ...v, status: 'approved' } : v
    ));
    success(`${selectedIds.size} violations approved`);
    setSelectedIds(new Set());
  };

  const handleBulkReject = () => {
    setViolations(prev => prev.map(v => 
      selectedIds.has(v._id) && v.status === 'pending' ? { ...v, status: 'rejected' } : v
    ));
    success(`${selectedIds.size} violations rejected`);
    setSelectedIds(new Set());
  };

  const handleExportCSV = () => {
    const dataToExport = selectedIds.size > 0 
      ? filteredViolations.filter(v => selectedIds.has(v._id))
      : filteredViolations;
    exportToCSV(dataToExport);
    success(`Exported ${dataToExport.length} records`);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredViolations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredViolations.map(v => v._id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilter('all');
    setDateFrom('');
    setDateTo('');
    setMinFine('');
    setMaxFine('');
  };

  const filteredViolations = violations.filter(v => {
    const matchesFilter = filter === 'all' || v.status === filter;
    const matchesSearch = v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Date filter
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(v.detectionTimestamp) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(v.detectionTimestamp) <= new Date(dateTo + 'T23:59:59');
    }
    
    // Fine amount filter
    let matchesFine = true;
    if (minFine) {
      matchesFine = matchesFine && v.fineAmount >= parseInt(minFine);
    }
    if (maxFine) {
      matchesFine = matchesFine && v.fineAmount <= parseInt(maxFine);
    }
    
    return matchesFilter && matchesSearch && matchesDate && matchesFine;
  });

  useEffect(() => {
    setShowBulkActions(selectedIds.size > 0);
  }, [selectedIds]);

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-500/20 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      paid: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };
    return (
      <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status}
      </span>
    );
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        {/* Background gradient */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-transparent to-orange-950/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="bg-black/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
            
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-red-400" />
                </div>
                <h1 className="text-lg text-white tracking-wider">{t('adminPortal')}</h1>
                <p className="text-white/40 text-xs tracking-wider mt-1">{t('detectionSystem')}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-white/40 text-[10px] tracking-wider uppercase block">{t('email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@highbeam.gov"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:border-red-500/50 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/40 text-[10px] tracking-wider uppercase block">{t('password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:border-red-500/50 focus:outline-none transition-all"
                  />
                </div>

                {loginError && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-xs text-center">{loginError}</p>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={loginLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-medium tracking-wider uppercase rounded-xl transition-all disabled:opacity-50 text-sm"
                >
                  {loginLoading ? (
                    <motion.div 
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    t('login')
                  )}
                </motion.button>
              </form>

              <p className="mt-6 pt-4 border-t border-white/5 text-center text-white/30 text-[10px] tracking-wider">
                Demo: admin@highbeam.gov / admin123
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return <AdminSkeleton />;
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/10 via-transparent to-orange-950/10" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-white tracking-wider">{t('adminPortal')}</h1>
                <p className="text-[10px] text-red-400/60 tracking-wider uppercase">{t('managementPortal')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
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
                onClick={() => setIsAuthenticated(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white transition-all text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              { label: t('totalDetections'), value: stats.totalViolations, icon: Activity, color: 'cyan' },
              { label: t('pendingApproval'), value: stats.pendingApproval, icon: Clock, color: 'yellow' },
              { label: t('approved'), value: stats.approved, icon: CheckCircle, color: 'green' },
              { label: t('revenue'), value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-4 sm:p-5"
              >
                <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-4 sm:w-5 h-4 sm:h-5 text-${stat.color}-400`} />
                </div>
                <p className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-lg sm:text-xl font-light text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Tab Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'table' ? 'bg-red-500 text-white' : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">{t('violationManagement')}</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'analytics' ? 'bg-red-500 text-white' : 'bg-white/5 text-white/50 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{t('analytics')}</span>
            </button>
          </div>

          {activeTab === 'analytics' ? (
            <AnalyticsCharts />
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:border-red-500/30 focus:outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all ${
                        filter === f 
                          ? 'bg-red-500 text-white' 
                          : 'bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      {t(f as any)}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-3 py-2 rounded-lg transition-all ${
                      showFilters ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white/50 hover:text-white'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm text-white/80">Advanced Filters</h3>
                        <button
                          onClick={clearFilters}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="text-white/40 text-[10px] uppercase tracking-wider block mb-1.5">
                            Date From
                          </label>
                          <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-red-500/30 focus:outline-none"
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>
                        <div>
                          <label className="text-white/40 text-[10px] uppercase tracking-wider block mb-1.5">
                            Date To
                          </label>
                          <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-red-500/30 focus:outline-none"
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>
                        <div>
                          <label className="text-white/40 text-[10px] uppercase tracking-wider block mb-1.5">
                            Min Fine (₹)
                          </label>
                          <input
                            type="number"
                            value={minFine}
                            onChange={(e) => setMinFine(e.target.value)}
                            placeholder="500"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:border-red-500/30 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-white/40 text-[10px] uppercase tracking-wider block mb-1.5">
                            Max Fine (₹)
                          </label>
                          <input
                            type="number"
                            value={maxFine}
                            onChange={(e) => setMaxFine(e.target.value)}
                            placeholder="5000"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:border-red-500/30 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bulk Actions Bar */}
              <AnimatePresence>
                {showBulkActions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 flex items-center justify-between flex-wrap gap-3"
                  >
                    <span className="text-red-400 text-sm">
                      {selectedIds.size} {t('selected')}
                    </span>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBulkApprove}
                        className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black rounded-lg text-sm font-medium transition-all"
                      >
                        {t('bulkApprove')}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBulkReject}
                        className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-medium transition-all"
                      >
                        {t('bulkReject')}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedIds(new Set())}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Violations Table */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <h2 className="text-sm text-white tracking-wider">{t('violationManagement')}</h2>
                    <span className="text-[10px] text-white/40 ml-2">
                      {filteredViolations.length} records
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white text-xs transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t('exportCSV')}
                  </motion.button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="p-4 text-left">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === filteredViolations.length && filteredViolations.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-red-500 focus:ring-red-500/30"
                          />
                        </th>
                        <th className="text-left p-4 text-white/40 text-[10px] uppercase tracking-wider font-medium">{t('vehicle')}</th>
                        <th className="text-left p-4 text-white/40 text-[10px] uppercase tracking-wider font-medium hidden sm:table-cell">{t('time')}</th>
                        <th className="text-left p-4 text-white/40 text-[10px] uppercase tracking-wider font-medium hidden md:table-cell">{t('location')}</th>
                        <th className="text-left p-4 text-white/40 text-[10px] uppercase tracking-wider font-medium">{t('intensity')}</th>
                        <th className="text-left p-4 text-white/40 text-[10px] uppercase tracking-wider font-medium">{t('fine')}</th>
                        <th className="text-left p-4 text-white/40 text-[10px] uppercase tracking-wider font-medium">{t('status')}</th>
                        <th className="text-left p-4 text-white/40 text-[10px] uppercase tracking-wider font-medium">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredViolations.map((violation) => (
                        <motion.tr
                          key={violation._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                            selectedIds.has(violation._id) ? 'bg-red-500/5' : ''
                          }`}
                        >
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(violation._id)}
                              onChange={() => toggleSelect(violation._id)}
                              className="w-4 h-4 rounded border-white/20 bg-white/5 text-red-500 focus:ring-red-500/30"
                            />
                          </td>
                          <td className="p-4">
                            <span className="text-white text-sm">{violation.vehicleNumber}</span>
                          </td>
                          <td className="p-4 text-white/50 text-xs hidden sm:table-cell">
                            {format(new Date(violation.detectionTimestamp), 'PP p')}
                          </td>
                          <td className="p-4 text-white/50 text-xs hidden md:table-cell max-w-[200px] truncate">
                            {violation.location.address}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    violation.beamIntensity > 80 ? 'bg-red-500' :
                                    violation.beamIntensity > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${violation.beamIntensity}%` }}
                                />
                              </div>
                              <span className="text-white/60 text-xs">{violation.beamIntensity}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-white text-sm">₹{violation.fineAmount}</td>
                          <td className="p-4">{getStatusBadge(violation.status)}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setSelectedViolation(violation)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4 text-white/40" />
                              </button>
                              {violation.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(violation._id)}
                                    className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(violation._id)}
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                  >
                                    <XCircle className="w-4 h-4 text-red-400" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredViolations.length === 0 && (
                    <div className="text-center py-12">
                      <AlertTriangle className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-white/40 text-sm">{t('noViolationsFoundAdmin')}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 mt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <p className="text-white/20 text-xs tracking-wider">Admin Panel v1.0</p>
            <a href="/" className="text-red-500/40 hover:text-red-400 text-xs tracking-wider transition-colors">
              {t('backToHome')}
            </a>
          </div>
        </footer>
      </div>

      {/* Evidence Modal */}
      <AnimatePresence>
        {selectedViolation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
            onClick={() => setSelectedViolation(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg text-white tracking-wider">{t('details')}</h3>
                <button 
                  onClick={() => setSelectedViolation(null)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video bg-white/5 rounded-xl mb-4 flex items-center justify-center">
                <Camera className="w-10 h-10 text-white/20" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                {[
                  { label: t('vehicle'), value: selectedViolation.vehicleNumber },
                  { label: t('intensity'), value: `${selectedViolation.beamIntensity}%` },
                  { label: t('aiConfidence'), value: `${(selectedViolation.aiConfidence * 100).toFixed(0)}%` },
                  { label: t('camera'), value: selectedViolation.cameraId },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-white/80">{item.value}</p>
                  </div>
                ))}
              </div>

              {selectedViolation.status === 'pending' && (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleReject(selectedViolation._id);
                      setSelectedViolation(null);
                    }}
                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white text-sm transition-all"
                  >
                    {t('reject')}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleApprove(selectedViolation._id);
                      setSelectedViolation(null);
                    }}
                    className="flex-1 py-3 bg-green-500 hover:bg-green-400 rounded-xl text-black font-medium text-sm transition-all"
                  >
                    {t('approve')}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
