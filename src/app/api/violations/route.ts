import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { validateSession } from '@/lib/auth';

/**
 * Get violations for authenticated user
 */
export async function GET() {
  try {
    // Validate user session
    const session = await validateSession();
    
    if (!session || !session.vehicleNumber) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Get vehicle info
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vehicle_number', session.vehicleNumber)
      .single();

    // Get all violations for this vehicle
    const { data: violations, error: violationsError } = await supabase
      .from('violations')
      .select('*')
      .eq('vehicle_number', session.vehicleNumber)
      .order('detection_timestamp', { ascending: false });

    if (violationsError) {
      console.error('Violations fetch error:', violationsError);
    }

    const violationsList = violations || [];

    // Calculate totals
    const totalFines = violationsList.reduce((sum, v) => sum + Number(v.fine_amount), 0);
    const pendingFines = violationsList
      .filter(v => v.status === 'approved')
      .reduce((sum, v) => sum + Number(v.fine_amount), 0);
    const paidFines = violationsList
      .filter(v => v.status === 'paid')
      .reduce((sum, v) => sum + Number(v.fine_amount), 0);

    return NextResponse.json({
      success: true,
      data: {
        vehicle: vehicle ? {
          vehicleNumber: vehicle.vehicle_number,
          ownerName: vehicle.owner_name,
          phoneNumber: vehicle.phone_number,
          email: vehicle.email,
        } : {
          vehicleNumber: session.vehicleNumber,
          ownerName: 'Unknown',
        },
        violations: violationsList.map(v => ({
          _id: v.id,
          vehicleNumber: v.vehicle_number,
          detectionTimestamp: v.detection_timestamp,
          location: {
            latitude: v.latitude,
            longitude: v.longitude,
            address: v.location_address || 'Unknown Location',
          },
          beamIntensity: v.beam_intensity,
          evidenceImageUrl: v.evidence_image_url,
          evidenceVideoUrl: v.evidence_video_url,
          fineAmount: Number(v.fine_amount),
          status: v.status,
          aiConfidence: v.ai_confidence,
          cameraId: v.camera_id,
          challanNumber: v.challan_number,
        })),
        totalFines,
        pendingFines,
        paidFines,
        violationCount: violationsList.length,
      },
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
