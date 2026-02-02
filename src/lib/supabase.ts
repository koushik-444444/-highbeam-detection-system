import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Database Types
export interface Vehicle {
  id: string;
  vehicle_number: string;
  owner_name: string;
  owner_dob: string;
  phone_number?: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Violation {
  id: string;
  vehicle_id?: string;
  vehicle_number: string;
  detection_timestamp: string;
  beam_intensity: number;
  ai_confidence: number;
  latitude?: number;
  longitude?: number;
  location_address?: string;
  evidence_image_url?: string;
  evidence_video_url?: string;
  camera_id?: string;
  device_id?: string;
  challan_number: string;
  fine_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid' | 'disputed';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  violation_id: string;
  vehicle_number: string;
  amount: number;
  currency: string;
  payment_method: 'upi' | 'card' | 'netbanking' | 'wallet';
  transaction_id: string;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  gateway_signature?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  receipt_number?: string;
  receipt_url?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DetectionLog {
  id: string;
  raw_payload: any;
  extracted_plate?: string;
  extraction_confidence?: number;
  processed: boolean;
  violation_id?: string;
  error_message?: string;
  source_ip?: string;
  camera_id?: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: Vehicle;
        Insert: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Vehicle, 'id'>>;
      };
      violations: {
        Row: Violation;
        Insert: Omit<Violation, 'id' | 'challan_number' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Violation, 'id' | 'challan_number'>>;
      };
      payments: {
        Row: Payment;
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Payment, 'id'>>;
      };
      detection_logs: {
        Row: DetectionLog;
        Insert: Omit<DetectionLog, 'id' | 'created_at'>;
        Update: Partial<Omit<DetectionLog, 'id'>>;
      };
    };
  };
}

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/client-side operations
export function createBrowserClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Server client with cookie handling for Next.js App Router
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore errors in Server Components
        }
      },
    },
  });
}

// Admin client with service role (for server-side operations that bypass RLS)
export function createAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper function to upload image to Supabase Storage
export async function uploadEvidenceImage(
  imageBase64: string,
  vehicleNumber: string
): Promise<string | null> {
  try {
    const supabase = createAdminClient();
    
    // Convert base64 to buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename
    const timestamp = Date.now();
    const filename = `violations/${vehicleNumber}/${timestamp}.jpg`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('evidence')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });
    
    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('evidence')
      .getPublicUrl(filename);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

// Helper to generate transaction ID
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `TXN${timestamp}${random}`.toUpperCase();
}

// Helper to format vehicle number
export function formatVehicleNumber(vehicleNumber: string): string {
  return vehicleNumber.toUpperCase().replace(/\s/g, '');
}
