'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'bg-white/5 animate-pulse';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <Skeleton variant="circular" width={40} height={40} className="mb-3" />
      <Skeleton variant="text" width="60%" height={10} className="mb-2" />
      <Skeleton variant="text" width="40%" height={24} />
    </div>
  );
}

// Violation Card Skeleton
export function ViolationCardSkeleton() {
  return (
    <div className="p-5 border-b border-white/5">
      <div className="flex items-start gap-4">
        <Skeleton variant="rectangular" width={56} height={56} className="rounded-xl" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton variant="text" width={60} height={16} />
            <Skeleton variant="text" width={40} height={16} />
          </div>
          <Skeleton variant="text" width="80%" height={14} className="mb-2" />
          <div className="flex gap-4">
            <Skeleton variant="text" width={100} height={12} />
            <Skeleton variant="text" width={120} height={12} />
          </div>
        </div>
        <div className="text-right">
          <Skeleton variant="text" width={60} height={10} className="mb-1" />
          <Skeleton variant="text" width={80} height={24} />
        </div>
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 7 }: { columns?: number }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton variant="text" width={i === 0 ? 100 : i === columns - 1 ? 80 : 60} height={14} />
        </td>
      ))}
    </tr>
  );
}

// Dashboard Loading Skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header Skeleton */}
      <div className="border-b border-white/5 bg-black/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton variant="rectangular" width={40} height={40} className="rounded-xl" />
            <div>
              <Skeleton variant="text" width={80} height={14} className="mb-1" />
              <Skeleton variant="text" width={100} height={10} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <Skeleton variant="text" width={100} height={14} className="mb-1" />
              <Skeleton variant="text" width={80} height={10} />
            </div>
            <Skeleton variant="rectangular" width={80} height={36} className="rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <StatsCardSkeleton />
            </motion.div>
          ))}
        </div>

        {/* Violations List */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width={120} height={14} />
            </div>
            <Skeleton variant="text" width={60} height={10} />
          </div>
          
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i + 0.5 }}
            >
              <ViolationCardSkeleton />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Admin Loading Skeleton
export function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <div className="border-b border-white/5 bg-black/40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton variant="rectangular" width={40} height={40} className="rounded-xl" />
            <div>
              <Skeleton variant="text" width={120} height={14} className="mb-1" />
              <Skeleton variant="text" width={100} height={10} />
            </div>
          </div>
          <Skeleton variant="rectangular" width={80} height={36} className="rounded-lg" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Skeleton variant="rectangular" height={40} className="flex-1 rounded-lg" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={60} height={40} className="rounded-lg" />
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <Skeleton variant="text" width={150} height={14} />
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <th key={i} className="p-4 text-left">
                    <Skeleton variant="text" width={60} height={10} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
