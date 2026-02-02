'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlassCard, Button, AnimatedGrid } from '@/components/ui';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle, 
  Download,
  ArrowLeft,
  Shield,
  Lock,
  AlertCircle,
  Loader2,
  Info,
  Activity,
  Zap,
  Award
} from 'lucide-react';

interface Violation {
  id: string;
  vehicle_number: string;
  challan_number: string;
  fine_amount: number;
  status: string;
  detection_timestamp: string;
  location?: string;
  beam_intensity?: number;
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const violationId = searchParams.get('violationId');

  const [step, setStep] = useState<'loading' | 'method' | 'processing' | 'success' | 'error'>('loading');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [violation, setViolation] = useState<Violation | null>(null);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);

  const paymentMethods = [
    { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', label: 'Card', icon: CreditCard, desc: 'Credit / Debit Card' },
    { id: 'netbanking', label: 'NetBanking', icon: Building2, desc: 'All major banks' },
  ];

  // Fetch violation details
  useEffect(() => {
    const fetchViolation = async () => {
      if (!violationId) {
        // Use demo data if no violation ID
        setViolation({
          id: 'demo-001',
          vehicle_number: 'MH12AB1234',
          challan_number: 'HB-2024-DEMO001',
          fine_amount: 1500,
          status: 'approved',
          detection_timestamp: new Date().toISOString(),
          location: 'Demo Location',
          beam_intensity: 85,
        });
        setStep('method');
        return;
      }

      try {
        const response = await fetch(`/api/violations?id=${violationId}`);
        const data = await response.json();

        if (data.success && data.data) {
          const violationData = Array.isArray(data.data) ? data.data[0] : data.data;
          
          if (!violationData) {
            setError('Violation not found');
            setStep('error');
            return;
          }

          if (violationData.status === 'paid') {
            setError('This challan has already been paid');
            setStep('error');
            return;
          }

          setViolation(violationData);
          setStep('method');
        } else {
          // Fallback to demo data
          setViolation({
            id: violationId,
            vehicle_number: 'MH12AB1234',
            challan_number: 'HB-2024-001',
            fine_amount: 1500,
            status: 'approved',
            detection_timestamp: new Date().toISOString(),
            beam_intensity: 85,
          });
          setStep('method');
        }
      } catch (err) {
        // Fallback to demo data on error
        setViolation({
          id: violationId || 'demo',
          vehicle_number: 'MH12AB1234',
          challan_number: 'HB-2024-001',
          fine_amount: 1500,
          status: 'approved',
          detection_timestamp: new Date().toISOString(),
          beam_intensity: 85,
        });
        setStep('method');
      }
    };

    fetchViolation();
  }, [violationId]);

  // Handle demo payment
  const handlePayment = async () => {
    if (!violation) return;

    setLoading(true);
    setStep('processing');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate demo transaction details
    const txnId = `TXN${Date.now()}`;
    setTransactionDetails({
      transactionId: txnId,
      paymentId: `pay_demo_${Date.now()}`,
      challanNumber: violation.challan_number,
      amount: violation.fine_amount,
      paymentMethod: paymentMethod.toUpperCase(),
    });

    setStep('success');
    setLoading(false);

    // Play success sound
    try {
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handleDownloadReceipt = () => {
    if (!transactionDetails || !violation) return;

    const receiptContent = `
=====================================
HIGH BEAM VIOLATION - PAYMENT RECEIPT
        [DEMO MODE]
=====================================

Transaction ID: ${transactionDetails.transactionId}
Payment ID: ${transactionDetails.paymentId}
Challan Number: ${transactionDetails.challanNumber}

-------------------------------------
VEHICLE DETAILS
-------------------------------------
Vehicle Number: ${violation.vehicle_number}
Violation Date: ${new Date(violation.detection_timestamp).toLocaleString()}
Location: ${violation.location || 'N/A'}

-------------------------------------
PAYMENT DETAILS
-------------------------------------
Fine Amount: Rs. ${transactionDetails.amount}
Payment Method: ${transactionDetails.paymentMethod}
Payment Status: PAID (DEMO)
Payment Date: ${new Date().toLocaleString()}

=====================================
NOTE: This is a demo receipt.
Real payments require Razorpay setup.
=====================================
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${transactionDetails.transactionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative">
      <AnimatedGrid />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Payment Gateway</h1>
              <p className="text-xs text-yellow-400">Demo Mode</p>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="relative z-10 bg-yellow-500/10 border-b border-yellow-500/30">
        <div className="max-w-4xl mx-auto px-6 py-2 flex items-center gap-2 text-yellow-400 text-sm">
          <Info className="w-4 h-4" />
          <span>Demo Mode - No real payments will be processed</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <GlassCard className="p-12 text-center max-w-md" hover={false}>
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                <p className="text-white/60">Loading violation details...</p>
              </GlassCard>
            </motion.div>
          )}

          {/* Error State */}
          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <GlassCard className="p-8 text-center max-w-md" hover={false}>
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                <p className="text-white/60 mb-6">{error}</p>
                <Button onClick={() => router.back()}>Go Back</Button>
              </GlassCard>
            </motion.div>
          )}

          {/* Step 1: Payment Method Selection */}
          {step === 'method' && violation && (
            <motion.div
              key="method"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Payment Summary */}
                <GlassCard className="p-6" hover={false}>
                  <h2 className="text-lg font-bold text-white mb-4">Payment Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-white/60">Challan Number</span>
                      <span className="text-white font-mono text-sm">{violation.challan_number}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-white/60">Vehicle Number</span>
                      <span className="text-white font-medium">{violation.vehicle_number}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-white/60">Violation Type</span>
                      <span className="text-white font-medium">High Beam Violation</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-white/60">Detection Date</span>
                      <span className="text-white text-sm">
                        {new Date(violation.detection_timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {violation.beam_intensity && (
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-white/60">Beam Intensity</span>
                        <span className="text-orange-400 font-medium">{violation.beam_intensity}%</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-3 border-b border-white/10">
                      <span className="text-white/60">Fine Amount</span>
                      <span className="text-2xl font-bold text-white">Rs.{violation.fine_amount}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-white/60">Convenience Fee</span>
                      <span className="text-green-400 font-medium">FREE</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">Total Amount</span>
                      <span className="text-3xl font-bold text-green-400">Rs.{violation.fine_amount}</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Payment Methods */}
                <GlassCard className="p-6" hover={false}>
                  <h2 className="text-lg font-bold text-white mb-4">Select Payment Method</h2>
                  
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <motion.button
                        key={method.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`
                          w-full p-4 rounded-xl border transition-all text-left
                          flex items-center gap-4
                          ${paymentMethod === method.id 
                            ? 'bg-cyan-500/20 border-cyan-500' 
                            : 'bg-white/5 border-white/10 hover:border-white/30'}
                        `}
                      >
                        <div className={`
                          w-12 h-12 rounded-lg flex items-center justify-center
                          ${paymentMethod === method.id ? 'bg-cyan-500' : 'bg-white/10'}
                        `}>
                          <method.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{method.label}</p>
                          <p className="text-white/60 text-sm">{method.desc}</p>
                        </div>
                        {paymentMethod === method.id && (
                          <CheckCircle className="w-6 h-6 text-cyan-400 ml-auto" />
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-white/40 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Demo Mode - No real transaction</span>
                  </div>

                  <Button
                    onClick={handlePayment}
                    loading={loading}
                    className="w-full mt-6 py-4"
                  >
                    Pay Rs.{violation.fine_amount} (Demo)
                  </Button>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* Step 2: Processing */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <div className="p-12 text-center max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl relative overflow-hidden">
                {/* Engine Start Animation */}
                <motion.div 
                  className="w-24 h-24 mx-auto mb-6 relative"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full" />
                  <div className="absolute inset-2 border-t-2 border-cyan-500/50 rounded-full" />
                  <div className="absolute inset-4 border-t-2 border-cyan-500/20 rounded-full" />
                  <Activity className="absolute inset-0 m-auto w-8 h-8 text-cyan-400" />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-white mb-2 tracking-widest uppercase italic">Settling Fine</h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <p className="text-white/60 text-xs tracking-[0.3em] uppercase">Engineered for speed</p>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && transactionDetails && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <div className="p-8 text-center max-w-lg w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl relative">
                {/* Success Glow */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-500/20 rounded-full blur-[60px]" />
                
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.3)]"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-3xl font-black text-white mb-1 tracking-tight uppercase italic">Transaction Complete</h2>
                  <div className="flex items-center justify-center gap-2 mb-6 text-green-400">
                    <Zap className="w-4 h-4 fill-current" />
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Record Cleared</span>
                  </div>

                  {/* Road Honor Score Card */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-2xl p-4 mb-6 relative group overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                          <Award className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">Road Honor Score</p>
                          <p className="text-lg font-bold text-white tracking-tight">920 / 1000</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-green-400 font-bold uppercase tracking-tighter bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">+15 XP</span>
                      </div>
                    </div>
                    {/* Progress indicator */}
                    <div className="mt-3 w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '92%' }}
                        transition={{ duration: 1, delay: 1 }}
                        className="h-full bg-yellow-500"
                      />
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownloadReceipt}
                      className="py-3.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                    >
                      <Download className="w-4 h-4" />
                      Receipt
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(6,182,212,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/dashboard')}
                      className="py-3.5 bg-cyan-500 text-black rounded-xl font-bold uppercase tracking-widest text-xs transition-all"
                    >
                      Dashboard
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && transactionDetails && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <GlassCard className="p-8 text-center max-w-lg w-full" hover={false}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
                  <p className="text-yellow-400 text-sm mb-4">(Demo Mode)</p>
                  <p className="text-white/60 mb-6">Your challan payment has been simulated</p>

                  <div className="bg-white/5 rounded-xl p-4 mb-6 text-left space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/60">Transaction ID</span>
                      <span className="text-white font-mono text-sm">{transactionDetails.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Payment ID</span>
                      <span className="text-white font-mono text-sm">{transactionDetails.paymentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Challan Number</span>
                      <span className="text-white font-mono text-sm">{transactionDetails.challanNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Amount Paid</span>
                      <span className="text-green-400 font-bold">Rs.{transactionDetails.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Payment Method</span>
                      <span className="text-white">{transactionDetails.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Date & Time</span>
                      <span className="text-white">{new Date().toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="secondary"
                      onClick={handleDownloadReceipt}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Receipt
                    </Button>
                    <Button
                      onClick={() => router.push('/dashboard')}
                      className="flex-1"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </motion.div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Security Footer */}
      <footer className="relative z-10 mt-8 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center gap-6 text-white/40 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Demo Gateway</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>No Real Payments</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
