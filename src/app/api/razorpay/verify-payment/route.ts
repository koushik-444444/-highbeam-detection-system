import { NextRequest, NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { createAdminClient, Payment, Violation } from '@/lib/supabase';

/**
 * Verify Razorpay Payment
 * This verifies the payment signature and updates the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId, // Our internal payment ID
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      console.error('Invalid Razorpay signature');
      return NextResponse.json(
        { success: false, message: 'Payment verification failed - Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find payment by Razorpay order ID
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('gateway_order_id', razorpay_order_id)
      .single();

    const payment = paymentData as any;

    if (paymentError || !payment) {
      return NextResponse.json(
        { success: false, message: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Generate receipt number
    const receiptNumber = `RCP-${payment.transaction_id}`;

    // Update payment record
    const { data: updatedPaymentData, error: updateError } = await supabase
      .from('payments')
      .update({
        gateway_payment_id: razorpay_payment_id,
        gateway_signature: razorpay_signature,
        status: 'completed',
        receipt_number: receiptNumber,
        paid_at: new Date().toISOString(),
      } as any)
      .eq('id', payment.id)
      .select()
      .single();

    const updatedPayment = updatedPaymentData as any;

    if (updateError || !updatedPayment) {
      console.error('Payment update error:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    // Update violation status to 'paid'
    const { error: violationError } = await supabase
      .from('violations')
      .update({ status: 'paid' } as any)
      .eq('id', payment.violation_id);

    if (violationError) {
      console.error('Violation update error:', violationError);
    }

    // Get violation details for response
    const { data: violationData } = await supabase
      .from('violations')
      .select('challan_number, vehicle_number')
      .eq('id', payment.violation_id)
      .single();

    const violation = violationData as any;

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: updatedPayment.id,
        transactionId: updatedPayment.transaction_id,
        receiptNumber: updatedPayment.receipt_number,
        amount: Number(updatedPayment.amount),
        paidAt: updatedPayment.paid_at,
        challanNumber: violation?.challan_number,
        vehicleNumber: violation?.vehicle_number,
        razorpayPaymentId: razorpay_payment_id,
      },
    });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
