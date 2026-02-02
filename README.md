# AI-Based High Beam Detection and Challan Notification System

A futuristic 3D full-stack web application for detecting high beam violations and managing challans.

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   ESP32-CAM     │────▶│      n8n        │────▶│   Supabase      │
│ (High Beam Det) │     │  (Workflow)     │     │  (Database)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │                        │
                              ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Hugging Face   │     │   Next.js App   │
                        │ (Plate Extract) │     │  (Web Portal)   │
                        └─────────────────┘     └─────────────────┘
```

## Features

- **3D Interactive UI** with Three.js car animation and headlight effects
- **ESP32/n8n Webhook Integration** for real-time violation detection
- **Supabase Database** for storing vehicles, violations, and payments
- **User Portal** for checking challans and making payments
- **Admin Panel** for approving/rejecting violations
- **AI Number Plate Extraction** via Hugging Face integration

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, Framer Motion, Three.js
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with httpOnly cookies
- **3D Graphics**: React Three Fiber, @react-three/drei

---

## Setup Instructions

### 1. Clone and Install

```bash
cd new-app
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings > API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

3. Run the database schema:
   - Go to **SQL Editor** in Supabase Dashboard
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Run the SQL to create all tables

4. (Optional) Create Storage Bucket:
   - Go to **Storage** in Supabase Dashboard
   - Create a bucket named `evidence`
   - Set it to **Public** for image access

### 3. Configure Environment Variables

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret (generate a random 32+ character string)
JWT_SECRET=your-super-secret-jwt-key

# Webhook API Key (for ESP32/n8n authentication)
WEBHOOK_API_KEY=your-webhook-secret-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Endpoints

### Webhook (for ESP32/n8n)

**POST** `/api/webhook/detection`

Headers:
```
x-api-key: your-webhook-api-key
Content-Type: application/json
```

Body:
```json
{
  "vehicle_number": "MH12AB1234",
  "beam_intensity": 85,
  "extraction_confidence": 0.95,
  "image_url": "https://storage.example.com/image.jpg",
  "camera_id": "CAM-001",
  "device_id": "ESP32-001",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777,
    "address": "Marine Drive, Mumbai"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "violation_id": "uuid",
    "challan_number": "HB2401-123456",
    "fine_amount": 1500
  }
}
```

### User Authentication

**POST** `/api/auth/login`
```json
{
  "vehicleNumber": "MH12AB1234",
  "dob": "1990-01-15"
}
```

### Get Violations

**GET** `/api/violations`

(Requires authentication cookie)

### Payment

**POST** `/api/payments`
```json
{
  "violationId": "uuid",
  "paymentMethod": "upi"
}
```

**PUT** `/api/payments`
```json
{
  "paymentId": "uuid",
  "gatewayPaymentId": "razorpay_payment_id"
}
```

### Admin

**GET** `/api/admin/violations` - List all violations

**PUT** `/api/admin/violations` - Approve/reject
```json
{
  "violationId": "uuid",
  "action": "approve"
}
```

---

## n8n Workflow Setup

1. Create a new workflow in n8n
2. Add **Webhook** trigger node (receive data from ESP32)
3. Add **HTTP Request** node to call Hugging Face Space for plate extraction
4. Add **HTTP Request** node to POST to your app's webhook:
   - URL: `https://your-app.vercel.app/api/webhook/detection`
   - Headers: `x-api-key: your-webhook-api-key`
   - Body: Map the extracted plate and image data

---

## Database Schema

### vehicles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vehicle_number | VARCHAR | Unique vehicle number |
| owner_name | VARCHAR | Owner's name |
| owner_dob | DATE | Date of birth for verification |
| phone_number | VARCHAR | Contact number |
| email | VARCHAR | Email address |

### violations
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| vehicle_number | VARCHAR | Vehicle number |
| challan_number | VARCHAR | Auto-generated challan ID |
| detection_timestamp | TIMESTAMP | When violation was detected |
| beam_intensity | INTEGER | 0-100 scale |
| ai_confidence | DECIMAL | Plate extraction confidence |
| evidence_image_url | TEXT | Link to captured image |
| fine_amount | DECIMAL | Auto-calculated fine |
| status | VARCHAR | pending/approved/rejected/paid |
| camera_id | VARCHAR | Camera identifier |

### payments
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| violation_id | UUID | Foreign key to violations |
| amount | DECIMAL | Payment amount |
| payment_method | VARCHAR | upi/card/netbanking |
| transaction_id | VARCHAR | Unique transaction ID |
| status | VARCHAR | pending/completed/failed |
| paid_at | TIMESTAMP | Payment timestamp |

---

## Demo Credentials

**User Portal:**
- Vehicle: `MH12AB1234`
- DOB: `1990-01-15`

**Admin Portal:**
- Email: `admin@highbeam.gov`
- Password: `admin123`

---

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

---

## ESP32 Integration Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* n8nWebhook = "https://your-n8n.app/webhook/highbeam";

void sendToN8N(String imageBase64, int beamIntensity) {
  HTTPClient http;
  http.begin(n8nWebhook);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{";
  payload += "\"image_base64\":\"" + imageBase64 + "\",";
  payload += "\"beam_intensity\":" + String(beamIntensity);
  payload += "}";
  
  http.POST(payload);
  http.end();
}
```

---

## License

MIT License - Smart City Traffic Management
