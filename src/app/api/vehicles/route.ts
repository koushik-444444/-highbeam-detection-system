import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, formatVehicleNumber, Vehicle } from '@/lib/supabase';

/**
 * Register a new vehicle owner
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleNumber, ownerName, ownerDob, phoneNumber, email, address } = body;

    // Validate required fields
    if (!vehicleNumber || !ownerName || !ownerDob) {
      return NextResponse.json(
        { success: false, message: 'Vehicle number, owner name, and date of birth are required' },
        { status: 400 }
      );
    }

    const formattedNumber = formatVehicleNumber(vehicleNumber);
    const supabase = createAdminClient();

    // Check if vehicle already exists
    const { data: existing } = await supabase
      .from('vehicles')
      .select('id')
      .eq('vehicle_number', formattedNumber)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Vehicle already registered' },
        { status: 409 }
      );
    }

    // Create vehicle record
    const { data: vehicleData, error } = await supabase
      .from('vehicles')
      .insert({
        vehicle_number: formattedNumber,
        owner_name: ownerName,
        owner_dob: ownerDob,
        phone_number: phoneNumber,
        email: email,
        address: address,
      } as any)
      .select()
      .single();

    const vehicle = vehicleData as any;

    if (error || !vehicle) {
      console.error('Registration error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to register vehicle' },
        { status: 500 }
      );
    }

    // Check if there are any existing violations for this vehicle number
    const { data: violations } = await supabase
      .from('violations')
      .select('id')
      .eq('vehicle_number', formattedNumber)
      .is('vehicle_id', null);

    // Link any existing violations to this vehicle
    if (violations && violations.length > 0) {
      await supabase
        .from('violations')
        .update({ vehicle_id: vehicle.id } as any)
        .eq('vehicle_number', formattedNumber);
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle registered successfully',
      data: {
        vehicleNumber: vehicle.vehicle_number,
        ownerName: vehicle.owner_name,
        pendingViolations: violations?.length || 0,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get vehicle details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleNumber = searchParams.get('vehicleNumber');

    if (!vehicleNumber) {
      return NextResponse.json(
        { success: false, message: 'Vehicle number required' },
        { status: 400 }
      );
    }

    const formattedNumber = formatVehicleNumber(vehicleNumber);
    const supabase = createAdminClient();

    const { data: vehicleData, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('vehicle_number', formattedNumber)
      .single();

    const vehicle = vehicleData as any;

    if (error || !vehicle) {
      return NextResponse.json(
        { success: false, message: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        vehicleNumber: vehicle.vehicle_number,
        ownerName: vehicle.owner_name,
        phoneNumber: vehicle.phone_number,
        email: vehicle.email,
      },
    });

  } catch (error) {
    console.error('Vehicle lookup error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
