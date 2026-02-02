import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Vehicle, Violation } from '@/lib/models';
import { hashSecret, generateChallanNumber } from '@/lib/auth';

// AI Detection Endpoint - receives data from YOLO/OpenCV system
export async function POST(request: NextRequest) {
  try {
    // Verify API key (simple auth for AI system)
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.AI_API_KEY && apiKey !== 'demo-ai-key') {
      return NextResponse.json(
        { success: false, message: 'Invalid API key' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      vehicleNumber,
      timestamp,
      location,
      beamIntensity,
      imageUrl,
      imageBase64,
      videoUrl,
      confidence,
      cameraId,
    } = body;

    // Validate required fields
    if (!vehicleNumber || !location || beamIntensity === undefined || !confidence) {
      return NextResponse.json(
        { success: false, message: 'Missing required detection data' },
        { status: 400 }
      );
    }

    // Validate confidence threshold (reject low confidence detections)
    if (confidence < 0.7) {
      return NextResponse.json(
        { success: false, message: 'Detection confidence too low', confidence },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Clean vehicle number
    const cleanedVehicleNumber = vehicleNumber.toUpperCase().replace(/\s/g, '');

    // Find or create vehicle
    let vehicle = await Vehicle.findOne({ vehicleNumber: cleanedVehicleNumber });
    
    if (!vehicle) {
      // Create placeholder vehicle (to be updated when owner logs in)
      vehicle = await Vehicle.create({
        vehicleNumber: cleanedVehicleNumber,
        ownerName: 'Unknown Owner',
        ownerDOBHash: await hashSecret('placeholder'),
      });
    }

    // Handle image - use URL or store base64
    let evidenceImageUrl = imageUrl;
    if (!evidenceImageUrl && imageBase64) {
      // In production, upload to S3/Cloudinary
      // For demo, we'll use a placeholder
      evidenceImageUrl = `data:image/jpeg;base64,${imageBase64.substring(0, 100)}...`;
    }
    
    if (!evidenceImageUrl) {
      evidenceImageUrl = '/images/placeholder-violation.jpg';
    }

    // Calculate fine amount based on beam intensity
    let fineAmount = 1000; // Base fine
    if (beamIntensity > 80) fineAmount = 2000;
    else if (beamIntensity > 60) fineAmount = 1500;

    // Create violation record
    const violation = await Violation.create({
      vehicleId: vehicle._id,
      vehicleNumber: cleanedVehicleNumber,
      detectionTimestamp: timestamp ? new Date(timestamp) : new Date(),
      location: {
        latitude: location.latitude || 19.0760,
        longitude: location.longitude || 72.8777,
        address: location.address || 'Detection Zone',
      },
      beamIntensity,
      evidenceImageUrl,
      evidenceVideoUrl: videoUrl,
      fineAmount,
      status: 'pending', // Needs admin approval
      aiConfidence: confidence,
      cameraId: cameraId || 'CAM-001',
    });

    // Generate challan number
    const challanNumber = generateChallanNumber();

    return NextResponse.json({
      success: true,
      message: 'Violation recorded successfully',
      data: {
        violationId: violation._id,
        challanNumber,
        vehicleNumber: cleanedVehicleNumber,
        fineAmount,
        status: 'pending_approval',
        detectionTimestamp: violation.detectionTimestamp,
      },
    });

  } catch (error) {
    console.error('AI Detection error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get detection statistics (for AI system dashboard)
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.AI_API_KEY && apiKey !== 'demo-ai-key') {
      return NextResponse.json(
        { success: false, message: 'Invalid API key' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalViolations,
      todayViolations,
      pendingApproval,
      avgConfidence,
    ] = await Promise.all([
      Violation.countDocuments(),
      Violation.countDocuments({ createdAt: { $gte: today } }),
      Violation.countDocuments({ status: 'pending' }),
      Violation.aggregate([
        { $group: { _id: null, avgConfidence: { $avg: '$aiConfidence' } } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalViolations,
        todayViolations,
        pendingApproval,
        averageConfidence: avgConfidence[0]?.avgConfidence || 0,
      },
    });

  } catch (error) {
    console.error('AI Stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
