import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, generateTransactionId } from '@/lib/supabase';
import { validateSession } from '@/lib/auth';

/**
 * Create payment order for a violation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await validateSession();
    
    if (!session || !session.vehicleNumber) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { violationId, paymentMethod } = body;

    if (!violationId || !paymentMethod) {
      return NextResponse.json(
        { success: false, message: 'Violation ID and payment method required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find violation
    const { data: violation, error: violationError } = await supabase
      .from('violations')
      .select('*')
      .eq('id', violationId)
      .single();

    if (violationError || !violation) {
      return NextResponse.json(
        { success: false, message: 'Violation not found' },
        { status: 404 }
      );
    }

    if (violation.status === 'paid') {
      return NextResponse.json(
        { success: false, message: 'This violation has already been paid' },
        { status: 400 }
      );
    }

    if (violation.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: 'This violation is not approved for payment yet' },
        { status: 400 }
      );
    }

    // Generate transaction ID
    const transactionId = generateTransactionId();

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        violation_id: violation.id,
        vehicle_number: violation.vehicle_number,
        amount: violation.fine_amount,
        currency: 'INR',
        payment_method: paymentMethod,
        transaction_id: transactionId,
        gateway_order_id: `order_${transactionId}`,
        status: 'pending',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return NextResponse.json(
        { success: false, message: 'Failed to create payment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: payment.gateway_order_id,
        transactionId: payment.transaction_id,
        amount: Number(payment.amount),
        currency: payment.currency,
        challanNumber: violation.challan_number,
      },
    });

  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Verify/Complete payment
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, gatewayPaymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: 'Payment ID required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Generate receipt number
    const receiptNumber = `RCP-${payment.transaction_id}`;

    // Update payment to completed
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        gateway_payment_id: gatewayPaymentId || `pay_${payment.transaction_id}`,
        receipt_number: receiptNumber,
        receipt_url: `/api/payments/receipt/${payment.id}`,
        paid_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (updateError) {
      console.error('Payment update error:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to update payment' },
        { status: 500 }
      );
    }

    // Update violation status to paid
    await supabase
      .from('violations')
      .update({ status: 'paid' })
      .eq('id', payment.violation_id);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        transactionId: updatedPayment.transaction_id,
        receiptNumber: updatedPayment.receipt_number,
        receiptUrl: updatedPayment.receipt_url,
        paidAt: updatedPayment.paid_at,
        amount: Number(updatedPayment.amount),
      },
    });

  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
