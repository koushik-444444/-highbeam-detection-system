'use client';

// PDF Challan Generator - Client-side PDF creation
// Using canvas-based approach for browser compatibility

interface ViolationData {
  _id: string;
  vehicleNumber: string;
  detectionTimestamp: string;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  beamIntensity: number;
  fineAmount: number;
  status: string;
  aiConfidence: number;
  cameraId: string;
}

export async function generateChallanPDF(violation: ViolationData): Promise<void> {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download the challan');
    return;
  }

  const challanNumber = `HB-${violation._id.slice(-8).toUpperCase()}`;
  const issueDate = new Date(violation.detectionTimestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const dueDate = new Date(
    new Date(violation.detectionTimestamp).getTime() + 15 * 24 * 60 * 60 * 1000
  ).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Traffic Violation Challan - ${challanNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #f5f5f5;
          padding: 20px;
        }
        .challan {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border: 2px solid #1a1a2e;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          padding: 20px;
          text-align: center;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 5px;
          letter-spacing: 2px;
        }
        .header p {
          font-size: 12px;
          opacity: 0.8;
        }
        .emblem {
          width: 60px;
          height: 60px;
          margin: 0 auto 10px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        .challan-info {
          display: flex;
          justify-content: space-between;
          padding: 15px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }
        .challan-info div {
          text-align: center;
        }
        .challan-info label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .challan-info span {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          margin-top: 5px;
        }
        .content {
          padding: 25px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        .field {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
        }
        .field label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .field span {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a2e;
          margin-top: 3px;
        }
        .fine-box {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin-top: 20px;
        }
        .fine-box label {
          font-size: 12px;
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .fine-box .amount {
          font-size: 36px;
          font-weight: 700;
          margin: 10px 0;
        }
        .fine-box .due {
          font-size: 12px;
          opacity: 0.8;
        }
        .footer {
          padding: 20px;
          background: #f8f9fa;
          border-top: 1px solid #eee;
          text-align: center;
        }
        .footer p {
          font-size: 11px;
          color: #666;
          margin-bottom: 5px;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 10px;
          border-radius: 6px;
          font-size: 12px;
          margin-top: 15px;
        }
        .qr-placeholder {
          width: 100px;
          height: 100px;
          background: #eee;
          margin: 15px auto;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #666;
        }
        @media print {
          body { background: white; padding: 0; }
          .challan { border: none; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="challan">
        <div class="header">
          <div class="emblem">🚦</div>
          <h1>TRAFFIC VIOLATION CHALLAN</h1>
          <p>AI-Based High Beam Detection System | Government of India</p>
        </div>
        
        <div class="challan-info">
          <div>
            <label>Challan Number</label>
            <span>${challanNumber}</span>
          </div>
          <div>
            <label>Issue Date</label>
            <span>${issueDate}</span>
          </div>
          <div>
            <label>Due Date</label>
            <span>${dueDate}</span>
          </div>
        </div>
        
        <div class="content">
          <div class="section">
            <div class="section-title">Violation Details</div>
            <div class="grid">
              <div class="field">
                <label>Vehicle Number</label>
                <span>${violation.vehicleNumber}</span>
              </div>
              <div class="field">
                <label>Violation Type</label>
                <span>High Beam Usage Violation</span>
              </div>
              <div class="field">
                <label>Date & Time</label>
                <span>${new Date(violation.detectionTimestamp).toLocaleString('en-IN')}</span>
              </div>
              <div class="field">
                <label>Location</label>
                <span>${violation.location.address}</span>
              </div>
              <div class="field">
                <label>Beam Intensity</label>
                <span>${violation.beamIntensity}%</span>
              </div>
              <div class="field">
                <label>AI Confidence</label>
                <span>${(violation.aiConfidence * 100).toFixed(1)}%</span>
              </div>
              <div class="field">
                <label>Camera ID</label>
                <span>${violation.cameraId}</span>
              </div>
              <div class="field">
                <label>Status</label>
                <span style="color: ${violation.status === 'paid' ? '#28a745' : '#dc3545'}">
                  ${violation.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <div class="fine-box">
            <label>Fine Amount</label>
            <div class="amount">₹${violation.fineAmount.toLocaleString('en-IN')}</div>
            <div class="due">Payment due by ${dueDate}</div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> Failure to pay the fine within the due date may result in additional penalties, 
            license suspension, or legal action as per the Motor Vehicles Act.
          </div>
          
          <div class="qr-placeholder">
            Scan to Pay
          </div>
        </div>
        
        <div class="footer">
          <p>This is a computer-generated challan and is valid without signature.</p>
          <p>For queries, contact: helpdesk@highbeam.gov.in | 1800-XXX-XXXX</p>
          <p style="margin-top: 10px; font-size: 10px; color: #999;">
            Generated by AI High Beam Detection System | ${new Date().toLocaleString('en-IN')}
          </p>
        </div>
      </div>
      
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="
          background: #1a1a2e;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        ">
          🖨️ Print / Save as PDF
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
