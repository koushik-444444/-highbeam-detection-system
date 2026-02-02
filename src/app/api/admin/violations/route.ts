import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, Violation } from '@/lib/supabase';

/**
 * Get all violations for admin dashboard
 */
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Get all violations
    const { data: violations, error: violationsError } = await supabase
      .from('violations')
      .select('*')
      .order('detection_timestamp', { ascending: false })
      .limit(100);

    if (violationsError) {
      console.error('Violations fetch error:', violationsError);
    }

    const violationsList = (violations || []) as Violation[];

    // Calculate stats
    const totalViolations = violationsList.length;
    const pendingApproval = violationsList.filter(v => v.status === 'pending').length;
    const approved = violationsList.filter(v => v.status === 'approved').length;
    const totalRevenue = violationsList
      .filter(v => v.status === 'paid')
      .reduce((sum, v) => sum + Number(v.fine_amount), 0);

    return NextResponse.json({
      success: true,
      violations: violationsList.map(v => ({
        _id: v.id,
        vehicleNumber: v.vehicle_number,
        detectionTimestamp: v.detection_timestamp,
        location: {
          latitude: v.latitude,
          longitude: v.longitude,
          address: v.location_address || 'Unknown',
        },
        beamIntensity: v.beam_intensity,
        evidenceImageUrl: v.evidence_image_url,
        fineAmount: Number(v.fine_amount),
        status: v.status,
        aiConfidence: v.ai_confidence,
        cameraId: v.camera_id,
        challanNumber: v.challan_number,
      })),
      stats: {
        totalViolations,
        pendingApproval,
        approved,
        totalRevenue,
      },
    });

  } catch (error) {
    console.error('Admin violations error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Approve or reject violation
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { violationId, action, notes } = body;

    if (!violationId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: violation, error } = await supabase
      .from('violations')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        review_notes: notes,
      } as any)
      .eq('id', violationId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to update violation' },
        { status: 500 }
      );
    }

    const updatedViolation = violation as Violation;

    return NextResponse.json({
      success: true,
      message: `Violation ${newStatus}`,
      violation: {
        _id: updatedViolation.id,
        status: updatedViolation.status,
        challanNumber: updatedViolation.challan_number,
      },
    });

  } catch (error) {
    console.error('Admin update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
