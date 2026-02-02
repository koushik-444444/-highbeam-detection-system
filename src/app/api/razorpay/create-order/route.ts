import { NextRequest, NextResponse } from 'next/server';
import razorpayInstance from '@/lib/razorpay';
import { createAdminClient, generateTransactionId, Violation, Payment } from '@/lib/supabase';
import { validateSession } from '@/lib/auth';

/**
 * Create Razorpay Order
 * This creates an order in Razorpay and stores it in our database
 */
export async function POST(request: NextRequest) {
  try {
    // Validate user session
    const session = await validateSession();
    if (!session || !session.vehicleNumber) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { violationId } = body;

    if (!violationId) {
      return NextResponse.json(
        { success: false, message: 'Violation ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get violation details
    const { data: violationData, error: violationError } = await supabase
      .from('violations')
      .select('*')
      .eq('id', violationId)
      .single();

    const violation = violationData as any;

    if (violationError || !violation) {
      return NextResponse.json(
        { success: false, message: 'Violation not found' },
        { status: 404 }
      );
    }

    // Check if already paid
    if (violation.status === 'paid') {
      return NextResponse.json(
        { success: false, message: 'This challan has already been paid' },
        { status: 400 }
      );
    }

    // Check if approved for payment
    if (violation.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: 'This challan is not approved for payment yet' },
        { status: 400 }
      );
    }

    // Generate unique receipt/transaction ID
    const transactionId = generateTransactionId();

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(Number(violation.fine_amount) * 100), // Amount in paise
      currency: 'INR',
      receipt: transactionId,
      notes: {
        violation_id: violationId,
        challan_number: violation.challan_number,
        vehicle_number: violation.vehicle_number,
      },
    });

    // Store payment record in database
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        violation_id: violationId,
        vehicle_number: violation.vehicle_number,
        amount: violation.fine_amount,
        currency: 'INR',
        payment_method: 'razorpay',
        transaction_id: transactionId,
        gateway_order_id: razorpayOrder.id,
        status: 'pending',
      } as any)
      .select()
      .single();

    const payment = paymentData as any;

    if (paymentError || !payment) {
      console.error('Payment record creation error:', paymentError);
      return NextResponse.json(
        { success: false, message: 'Failed to create payment record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentId: payment.id,
        transactionId: transactionId,
        challanNumber: violation.challan_number,
        vehicleNumber: violation.vehicle_number,
        keyId: process.env.RAZORPAY_KEY_ID, // Public key for frontend
      },
    });

  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
