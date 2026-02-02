import Razorpay from 'razorpay';

// Lazy-load Razorpay instance only when needed
let razorpayInstance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay | null {
  // Return null if keys not configured (demo mode)
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('Razorpay keys not configured - payment features disabled');
    return null;
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayInstance;
}

// For backward compatibility - returns a mock if not configured
const razorpayProxy = {
  orders: {
    create: async (options: any) => {
      const instance = getRazorpayInstance();
      if (!instance) {
        // Return mock order for demo mode
        return {
          id: `order_demo_${Date.now()}`,
          amount: options.amount,
          currency: options.currency || 'INR',
          receipt: options.receipt,
        };
      }
      return instance.orders.create(options);
    },
  },
};

export default razorpayProxy;

// Verify Razorpay signature
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  // In demo mode, always return true
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return true;
  }

  const crypto = require('crypto');
  
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
}
