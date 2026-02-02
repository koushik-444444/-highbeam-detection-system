import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, uploadEvidenceImage, formatVehicleNumber, DetectionLog, Violation, Vehicle } from '@/lib/supabase';

/**
 * ESP32/n8n Webhook Endpoint
 * 
 * This endpoint receives high beam detection data from the hardware system:
 * 1. ESP-CAM captures the image when high beam is detected
 * 2. ESP32 triggers n8n workflow
 * 3. n8n extracts number plate using Hugging Face
 * 4. n8n calls this webhook with all the data
 * 
 * Expected payload from n8n:
 * {
 *   "vehicle_number": "MH12AB1234",       // Extracted from image
 *   "extraction_confidence": 0.95,         // Plate extraction confidence
 *   "beam_intensity": 85,                  // 0-100 scale
 *   "image_base64": "...",                 // Base64 encoded image
 *   "image_url": "...",                    // OR direct URL to image
 *   "camera_id": "CAM-001",                // Camera identifier
 *   "device_id": "ESP32-001",              // ESP32 device ID
 *   "location": {                          // Optional location
 *     "latitude": 19.0760,
 *     "longitude": 72.8777,
 *     "address": "Marine Drive, Mumbai"
 *   },
 *   "timestamp": "2024-01-15T10:30:00Z"   // Detection timestamp
 * }
 */

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key') || request.headers.get('authorization')?.replace('Bearer ', '');
    const expectedKey = process.env.WEBHOOK_API_KEY;
    
    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Log the raw detection for debugging
    const { data: logDataRaw, error: logError } = await supabase
      .from('detection_logs')
      .insert({
        raw_payload: body,
        extracted_plate: body.vehicle_number,
        extraction_confidence: body.extraction_confidence,
        source_ip: request.headers.get('x-forwarded-for') || 'unknown',
        camera_id: body.camera_id,
        processed: false,
      } as any)
      .select()
      .single();

    const logData = logDataRaw as any;

    if (logError) {
      console.error('Failed to log detection:', logError);
    }

    // Validate required fields
    const { 
      vehicle_number, 
      beam_intensity, 
      extraction_confidence,
      image_base64,
      image_url,
      camera_id,
      device_id,
      location,
      timestamp 
    } = body;

    if (!vehicle_number) {
      // Update log with error
      if (logData) {
        await supabase
          .from('detection_logs')
          .update({ error_message: 'Missing vehicle_number', processed: true } as any)
          .eq('id', logData.id);
      }
      
      return NextResponse.json(
        { success: false, error: 'Missing required field: vehicle_number' },
        { status: 400 }
      );
    }

    // Validate beam intensity
    const intensity = Number(beam_intensity) || 80;
    if (intensity < 50) {
      // Low intensity - might be false positive
      if (logData) {
        await supabase
          .from('detection_logs')
          .update({ error_message: 'Beam intensity too low', processed: true } as any)
          .eq('id', logData.id);
      }
      
      return NextResponse.json(
        { success: false, error: 'Beam intensity too low for violation' },
        { status: 400 }
      );
    }

    // Format vehicle number
    const formattedPlate = formatVehicleNumber(vehicle_number);

    // Upload evidence image to Supabase Storage (if base64 provided)
    let evidenceImageUrl = image_url;
    if (image_base64 && !evidenceImageUrl) {
      evidenceImageUrl = await uploadEvidenceImage(image_base64, formattedPlate);
    }

    // Look up vehicle in database to get owner info
    const { data: vehicleDataRaw } = await supabase
      .from('vehicles')
      .select('id, owner_name, phone_number, email')
      .eq('vehicle_number', formattedPlate)
      .single();

    const vehicleData = vehicleDataRaw as any;

    // Create violation record
    const { data: violationRaw, error: violationError } = await supabase
      .from('violations')
      .insert({
        vehicle_id: vehicleData?.id || null,
        vehicle_number: formattedPlate,
        detection_timestamp: timestamp || new Date().toISOString(),
        beam_intensity: intensity,
        ai_confidence: extraction_confidence || 0.9,
        latitude: location?.latitude,
        longitude: location?.longitude,
        location_address: location?.address || 'Detection Zone',
        evidence_image_url: evidenceImageUrl,
        camera_id: camera_id || 'UNKNOWN',
        device_id: device_id,
        status: 'pending', // Requires admin approval
      } as any)
      .select()
      .single();

    const violation = violationRaw as any;

    if (violationError || !violation) {
      console.error('Failed to create violation:', violationError);
      
      if (logData) {
        await supabase
          .from('detection_logs')
          .update({ error_message: violationError?.message || 'Unknown error', processed: true } as any)
          .eq('id', logData.id);
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to create violation record' },
        { status: 500 }
      );
    }

    // Update detection log with violation ID
    if (logData) {
      await supabase
        .from('detection_logs')
        .update({ violation_id: violation.id, processed: true } as any)
        .eq('id', logData.id);
    }

    // TODO: Send notification to vehicle owner (SMS/Email via n8n or Twilio)
    // This can be handled by another n8n workflow triggered by Supabase webhook

    return NextResponse.json({
      success: true,
      message: 'Violation recorded successfully',
      data: {
        violation_id: violation.id,
        challan_number: violation.challan_number,
        vehicle_number: formattedPlate,
        fine_amount: violation.fine_amount,
        status: violation.status,
        owner_found: !!vehicleData,
        owner_name: vehicleData?.owner_name || 'Unknown',
      },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for health check / testing
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'High Beam Detection Webhook',
    timestamp: new Date().toISOString(),
    endpoints: {
      POST: 'Submit detection data from ESP32/n8n',
    },
    required_headers: {
      'x-api-key': 'Your webhook API key',
      'Content-Type': 'application/json',
    },
    payload_example: {
      vehicle_number: 'MH12AB1234',
      beam_intensity: 85,
      extraction_confidence: 0.95,
      image_url: 'https://example.com/image.jpg',
      camera_id: 'CAM-001',
      device_id: 'ESP32-001',
      location: {
        latitude: 19.076,
        longitude: 72.8777,
        address: 'Marine Drive, Mumbai',
      },
    },
  });
}
