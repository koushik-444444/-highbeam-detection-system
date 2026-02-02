import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, formatVehicleNumber, Vehicle } from '@/lib/supabase';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

/**
 * User Login API
 * Verifies vehicle number and DOB against Supabase database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleNumber, dob } = body;

    // Validate input
    if (!vehicleNumber || !dob) {
      return NextResponse.json(
        { success: false, message: 'Vehicle number and date of birth are required' },
        { status: 400 }
      );
    }

    // Format vehicle number
    const formattedNumber = formatVehicleNumber(vehicleNumber);

    const supabase = createAdminClient();

    // Look up vehicle in database
    const { data: vehicleData, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vehicle_number', formattedNumber)
      .single();

    const vehicle = vehicleData as any;

    if (vehicleError || !vehicle) {
      // For demo: Create vehicle if not exists
      const { data: newVehicleData, error: createError } = await supabase
        .from('vehicles')
        .insert({
          vehicle_number: formattedNumber,
          owner_name: 'Vehicle Owner',
          owner_dob: dob,
        } as any)
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { success: false, message: 'Vehicle not found in our records. Please register first.' },
          { status: 404 }
        );
      }

      const newVehicle = newVehicleData as any;

      // Use newly created vehicle
      const token = await createToken({ vehicleNumber: formattedNumber });
      
      const cookieStore = await cookies();
      cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        hasViolations: false,
        vehicle: {
          vehicleNumber: newVehicle.vehicle_number,
          ownerName: newVehicle.owner_name,
        },
      });
    }

    // Verify DOB
    const vehicleDob = new Date(vehicle.owner_dob).toISOString().split('T')[0];
    const inputDob = new Date(dob).toISOString().split('T')[0];

    if (vehicleDob !== inputDob) {
      return NextResponse.json(
        { success: false, message: 'Date of birth does not match our records' },
        { status: 401 }
      );
    }

    // Check for violations
    const { data: violations } = await supabase
      .from('violations')
      .select('id, status')
      .eq('vehicle_number', formattedNumber)
      .in('status', ['pending', 'approved']);

    const hasViolations = violations && violations.length > 0;

    // Create JWT token
    const token = await createToken({ vehicleNumber: formattedNumber });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      hasViolations,
      vehicle: {
        vehicleNumber: vehicle.vehicle_number,
        ownerName: vehicle.owner_name,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
