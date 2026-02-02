'use client';

import { motion } from 'framer-motion';
import { format, parseISO, isSameMonth, isSameYear } from 'date-fns';
import { Clock, MapPin, CheckCircle, XCircle, AlertTriangle, CreditCard } from 'lucide-react';

interface Violation {
  _id: string;
  vehicleNumber: string;
  detectionTimestamp: string;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  beamIntensity: number;
  fineAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  aiConfidence: number;
  evidenceImageUrl?: string;
  cameraId?: string;
}

interface ViolationTimelineProps {
  violations: Violation[];
  onViewEvidence?: (violation: Violation) => void;
  onPay?: (violation: any) => void;
}

export default function ViolationTimeline({
  violations,
  onViewEvidence,
  onPay,
}: ViolationTimelineProps) {
  // Group violations by month
  const groupedViolations = violations.reduce((groups, violation) => {
    const date = parseISO(violation.detectionTimestamp);
    const monthKey = format(date, 'MMMM yyyy');
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(violation);
    return groups;
  }, {} as Record<string, Violation[]>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'approved':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'approved':
        return 'bg-red-500';
      case 'rejected':
        return 'bg-gray-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'approved':
        return 'Unpaid';
      case 'rejected':
        return 'Dismissed';
      default:
        return 'Pending';
    }
  };

  if (violations.length === 0) {
    return (
      <div className="text-center py-16">
        <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
        <h3 className="text-lg text-white/80 mb-1">All Clear</h3>
        <p className="text-white/40 text-sm">No violations in your timeline.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {Object.entries(groupedViolations).map(([monthYear, monthViolations], groupIndex) => (
        <div key={monthYear} className="mb-8">
          {/* Month Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <h3 className="text-sm font-medium text-cyan-400 uppercase tracking-wider">
              {monthYear}
            </h3>
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">
              {monthViolations.length} {monthViolations.length === 1 ? 'violation' : 'violations'}
            </span>
          </motion.div>

          {/* Timeline Items */}
          <div className="relative ml-1.5 pl-6 border-l border-white/10">
            {monthViolations.map((violation, index) => (
              <motion.div
                key={violation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                className="relative mb-4 last:mb-0"
              >
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[25px] top-3 w-2 h-2 rounded-full ${getStatusColor(
                    violation.status
                  )}`}
                />

                {/* Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      {/* Status & Time */}
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(violation.status)}
                        <span
                          className={`text-xs uppercase tracking-wider ${
                            violation.status === 'paid'
                              ? 'text-green-400'
                              : violation.status === 'approved'
                              ? 'text-red-400'
                              : violation.status === 'rejected'
                              ? 'text-gray-400'
                              : 'text-yellow-400'
                          }`}
                        >
                          {getStatusLabel(violation.status)}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-white/40 text-xs">
                          {format(parseISO(violation.detectionTimestamp), 'PPp')}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5 text-white/60 text-sm mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{violation.location.address}</span>
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span>Intensity: {violation.beamIntensity}%</span>
                        <span>AI: {(violation.aiConfidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Fine & Actions */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Fine</p>
                        <p className="text-lg font-light text-white">₹{violation.fineAmount}</p>
                      </div>

                      {violation.status === 'approved' && onPay && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onPay(violation)}
                          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg font-medium text-sm transition-all"
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
        </div>
      ))}
    </div>
  );
}
