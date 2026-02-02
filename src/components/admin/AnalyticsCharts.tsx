'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Clock, DollarSign, Car } from 'lucide-react';

// Mock data for charts
const violationsPerDayData = [
  { date: 'Mon', violations: 12 },
  { date: 'Tue', violations: 19 },
  { date: 'Wed', violations: 15 },
  { date: 'Thu', violations: 25 },
  { date: 'Fri', violations: 32 },
  { date: 'Sat', violations: 18 },
  { date: 'Sun', violations: 8 },
];

const peakHoursData = [
  { hour: '6AM', count: 5 },
  { hour: '8AM', count: 15 },
  { hour: '10AM', count: 8 },
  { hour: '12PM', count: 6 },
  { hour: '2PM', count: 7 },
  { hour: '4PM', count: 12 },
  { hour: '6PM', count: 28 },
  { hour: '8PM', count: 35 },
  { hour: '10PM', count: 22 },
  { hour: '12AM', count: 10 },
];

const fineCollectionData = [
  { name: 'Collected', value: 178500, color: '#22c55e' },
  { name: 'Pending', value: 45000, color: '#eab308' },
  { name: 'Overdue', value: 12000, color: '#ef4444' },
];

const vehicleTypesData = [
  { type: 'Cars', count: 89, color: '#06b6d4' },
  { type: 'Motorcycles', count: 45, color: '#8b5cf6' },
  { type: 'SUVs', count: 32, color: '#f59e0b' },
  { type: 'Trucks', count: 12, color: '#ec4899' },
];

interface AnalyticsChartsProps {
  className?: string;
}

export default function AnalyticsCharts({ className = '' }: AnalyticsChartsProps) {
  const [activeChart, setActiveChart] = useState<'line' | 'bar' | 'pie' | 'vehicle'>('line');

  const charts = [
    { id: 'line', label: 'Violations/Day', icon: TrendingUp },
    { id: 'bar', label: 'Peak Hours', icon: Clock },
    { id: 'pie', label: 'Fine Collection', icon: DollarSign },
    { id: 'vehicle', label: 'Vehicle Types', icon: Car },
  ] as const;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white/60 text-xs mb-1">{label}</p>
          <p className="text-white font-medium">
            {payload[0].name}: {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden ${className}`}>
      {/* Chart Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto">
        {charts.map((chart) => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap transition-all ${
              activeChart === chart.id
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <chart.icon className="w-4 h-4" />
            <span>{chart.label}</span>
          </button>
        ))}
      </div>

      {/* Chart Content */}
      <div className="p-6">
        <motion.div
          key={activeChart}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="h-[300px]"
        >
          {activeChart === 'line' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={violationsPerDayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="violations"
                  name="Violations"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="hour" 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={11}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="Violations"
                  fill="#06b6d4" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'pie' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fineCollectionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {fineCollectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-white/60 text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'vehicle' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleTypesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  type="number"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                />
                <YAxis 
                  type="category"
                  dataKey="type"
                  stroke="rgba(255,255,255,0.3)"
                  fontSize={12}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="Vehicles"
                  radius={[0, 4, 4, 0]}
                >
                  {vehicleTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Chart Legend/Summary */}
        <div className="mt-6 pt-4 border-t border-white/5">
          {activeChart === 'line' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40">Weekly Average</span>
              <span className="text-white font-medium">
                {Math.round(
                  violationsPerDayData.reduce((acc, d) => acc + d.violations, 0) / 7
                )}{' '}
                violations/day
              </span>
            </div>
          )}
          {activeChart === 'bar' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40">Peak Time</span>
              <span className="text-white font-medium">8 PM - 10 PM (Evening Rush)</span>
            </div>
          )}
          {activeChart === 'pie' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40">Total Fines</span>
              <span className="text-white font-medium">
                ₹{fineCollectionData.reduce((acc, d) => acc + d.value, 0).toLocaleString()}
              </span>
            </div>
          )}
          {activeChart === 'vehicle' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40">Most Common</span>
              <span className="text-white font-medium">Cars (50% of violations)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
