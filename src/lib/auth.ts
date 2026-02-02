import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-change-in-production');

export interface JWTPayload {
  vehicleNumber?: string;
  isAdmin?: boolean;
  adminId?: string;
  exp?: number;
}

/**
 * Hash a string (DOB) for secure storage
 */
export async function hashSecret(secret: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(secret, salt);
}

/**
 * Verify a secret against its hash
 */
export async function verifySecret(secret: string, hash: string): Promise<boolean> {
  return bcrypt.compare(secret, hash);
}

/**
 * Create a JWT token for authenticated users
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
  
  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get token from cookies
 */
export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  return token?.value || null;
}

/**
 * Validate user session from cookies
 */
export async function validateSession(): Promise<JWTPayload | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Format vehicle number to standard format
 * Example: MH12AB1234 -> MH 12 AB 1234
 */
export function formatVehicleNumber(vehicleNumber: string): string {
  const cleaned = vehicleNumber.toUpperCase().replace(/\s/g, '');
  const match = cleaned.match(/^([A-Z]{2})(\d{2})([A-Z]{1,2})(\d{1,4})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  return cleaned;
}

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `TXN${timestamp}${randomPart}`.toUpperCase();
}

/**
 * Generate challan number
 */
export function generateChallanNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `HB${year}${month}${random}`;
}
