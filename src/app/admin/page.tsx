'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { GlassCard, Button, Badge, Input, AnimatedGrid } from '@/components/ui';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Camera,
  Users,
  AlertTriangle,
  DollarSign,
  Activity,
  LogOut,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

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
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  // Demo admin login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    // Demo credentials
    if (email === 'admin@highbeam.gov' && password === 'admin123') {
      setTimeout(() => {
        setIsAuthenticated(true);
        setLoginLoading(false);
        loadViolations();
      }, 1000);
    } else {
      setLoginError('Invalid credentials. Use admin@highbeam.gov / admin123');
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
      console.error('Error loading violations:', error);
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
    try {
      await fetch('/api/admin/violations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ violationId, action: 'approve' }),
      });
      setViolations(prev => prev.map(v => 
        v._id === violationId ? { ...v, status: 'approved' } : v
      ));
    } catch (error) {
      console.error('Error approving:', error);
      // Demo update
      setViolations(prev => prev.map(v => 
        v._id === violationId ? { ...v, status: 'approved' } : v
      ));
    }
  };

  const handleReject = async (violationId: string) => {
    try {
      await fetch('/api/admin/violations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ violationId, action: 'reject' }),
      });
      setViolations(prev => prev.map(v => 
        v._id === violationId ? { ...v, status: 'rejected' } : v
      ));
    } catch (error) {
      console.error('Error rejecting:', error);
      // Demo update
      setViolations(prev => prev.map(v => 
        v._id === violationId ? { ...v, status: 'rejected' } : v
      ));
    }
  };

  const filteredViolations = violations.filter(v => {
    const matchesFilter = filter === 'all' || v.status === filter;
    const matchesSearch = v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         v.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'paid':
        return <Badge variant="info">Paid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 relative flex items-center justify-center">
        <AnimatedGrid />
        
        <GlassCard className="p-8 w-full max-w-md relative z-10" hover={false}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-white/60 text-sm mt-1">High Beam Detection System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="admin@highbeam.gov"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter password"
            />

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm text-center">{loginError}</p>
              </div>
            )}

            <Button type="submit" loading={loginLoading} className="w-full py-4">
              Login to Admin Panel
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/40 text-xs">
              Demo: admin@highbeam.gov / admin123
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative">
      <AnimatedGrid />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
              <p className="text-xs text-red-400">High Beam Detection System</p>
            </div>
          </div>

          <Button 
            variant="secondary" 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Detections</p>
                  <p className="text-2xl font-bold text-white">{stats.totalViolations}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Pending Approval</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingApproval}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-white">{stats.approved}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vehicle number or location..."
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Violations Table */}
        <GlassCard className="overflow-hidden" hover={false}>
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Violation Management
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/60 font-medium">Vehicle</th>
                  <th className="text-left p-4 text-white/60 font-medium">Detection Time</th>
                  <th className="text-left p-4 text-white/60 font-medium">Location</th>
                  <th className="text-left p-4 text-white/60 font-medium">Intensity</th>
                  <th className="text-left p-4 text-white/60 font-medium">AI Conf.</th>
                  <th className="text-left p-4 text-white/60 font-medium">Fine</th>
                  <th className="text-left p-4 text-white/60 font-medium">Status</th>
                  <th className="text-left p-4 text-white/60 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredViolations.map((violation) => (
                  <motion.tr
                    key={violation._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Camera className="w-4 h-4 text-white/60" />
                        </div>
                        <span className="text-white font-medium">{violation.vehicleNumber}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white/60 text-sm">
                      {format(new Date(violation.detectionTimestamp), 'PP p')}
                    </td>
                    <td className="p-4 text-white/60 text-sm">
                      {violation.location.address}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              violation.beamIntensity > 80 ? 'bg-red-500' :
                              violation.beamIntensity > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${violation.beamIntensity}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{violation.beamIntensity}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-white text-sm">
                      {(violation.aiConfidence * 100).toFixed(0)}%
                    </td>
                    <td className="p-4 text-white font-medium">
                      ₹{violation.fineAmount}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(violation.status)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedViolation(violation)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="View Evidence"
                        >
                          <Eye className="w-4 h-4 text-white/60" />
                        </button>
                        {violation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(violation._id)}
                              className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            </button>
                            <button
                              onClick={() => handleReject(violation._id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Reject"
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
                <AlertTriangle className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">No violations found</p>
              </div>
            )}
          </div>
        </GlassCard>
      </main>

      {/* Evidence Modal */}
      <AnimatePresence>
        {selectedViolation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedViolation(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Violation Details</h3>
              
              <div className="aspect-video bg-slate-800 rounded-xl mb-4 flex items-center justify-center">
                <Camera className="w-16 h-16 text-white/20" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60">Vehicle</p>
                  <p className="text-white font-medium">{selectedViolation.vehicleNumber}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60">Beam Intensity</p>
                  <p className="text-white font-medium">{selectedViolation.beamIntensity}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60">AI Confidence</p>
                  <p className="text-white font-medium">{(selectedViolation.aiConfidence * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/60">Camera</p>
                  <p className="text-white font-medium">{selectedViolation.cameraId}</p>
                </div>
              </div>

              {selectedViolation.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      handleReject(selectedViolation._id);
                      setSelectedViolation(null);
                    }}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      handleApprove(selectedViolation._id);
                      setSelectedViolation(null);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}

              <Button 
                variant="secondary" 
                className="w-full mt-3"
                onClick={() => setSelectedViolation(null)}
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
