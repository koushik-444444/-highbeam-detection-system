-- =====================================================
-- HIGH BEAM DETECTION SYSTEM - SUPABASE DATABASE SCHEMA
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. VEHICLES TABLE
-- Stores registered vehicle owner information
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_number VARCHAR(20) UNIQUE NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    owner_dob DATE NOT NULL,
    phone_number VARCHAR(15),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast vehicle number lookups
CREATE INDEX IF NOT EXISTS idx_vehicles_number ON vehicles(vehicle_number);

-- =====================================================
-- 2. VIOLATIONS TABLE  
-- Stores high beam violation incidents detected by AI
-- =====================================================
CREATE TABLE IF NOT EXISTS violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    
    -- Detection details
    detection_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    beam_intensity INTEGER NOT NULL CHECK (beam_intensity >= 0 AND beam_intensity <= 100),
    ai_confidence DECIMAL(4,3) NOT NULL CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
    
    -- Location information
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_address TEXT,
    
    -- Evidence
    evidence_image_url TEXT,
    evidence_video_url TEXT,
    
    -- Camera/Device info
    camera_id VARCHAR(50),
    device_id VARCHAR(100),
    
    -- Challan details
    challan_number VARCHAR(50) UNIQUE,
    fine_amount DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid', 'disputed')),
    
    -- Admin actions
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_violations_vehicle_number ON violations(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);
CREATE INDEX IF NOT EXISTS idx_violations_timestamp ON violations(detection_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_violations_challan ON violations(challan_number);

-- =====================================================
-- 3. PAYMENTS TABLE
-- Stores payment transactions for violations
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    violation_id UUID REFERENCES violations(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(20) NOT NULL,
    
    -- Payment details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(20) CHECK (payment_method IN ('upi', 'card', 'netbanking', 'wallet')),
    
    -- Transaction info
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    gateway_order_id VARCHAR(100),
    gateway_payment_id VARCHAR(100),
    gateway_signature VARCHAR(255),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    
    -- Receipt
    receipt_number VARCHAR(50),
    receipt_url TEXT,
    
    -- Timestamps
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_violation ON payments(violation_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =====================================================
-- 4. DETECTION_LOGS TABLE
-- Raw logs from ESP32/n8n webhook for debugging
-- =====================================================
CREATE TABLE IF NOT EXISTS detection_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Raw data from ESP32/n8n
    raw_payload JSONB,
    
    -- Extracted data
    extracted_plate VARCHAR(20),
    extraction_confidence DECIMAL(4,3),
    
    -- Processing status
    processed BOOLEAN DEFAULT FALSE,
    violation_id UUID REFERENCES violations(id),
    error_message TEXT,
    
    -- Source info
    source_ip VARCHAR(45),
    camera_id VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for unprocessed logs
CREATE INDEX IF NOT EXISTS idx_detection_logs_processed ON detection_logs(processed) WHERE processed = FALSE;

-- =====================================================
-- 5. ADMINS TABLE
-- Admin users for the system
-- =====================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'operator' CHECK (role IN ('super_admin', 'admin', 'operator')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. NOTIFICATIONS TABLE
-- Track sent notifications (SMS/Email)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    violation_id UUID REFERENCES violations(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    
    type VARCHAR(20) CHECK (type IN ('sms', 'email', 'push')),
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_violations_updated_at
    BEFORE UPDATE ON violations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate challan number
CREATE OR REPLACE FUNCTION generate_challan_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.challan_number IS NULL THEN
        NEW.challan_number := 'HB' || TO_CHAR(NOW(), 'YYMM') || '-' || 
                              LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_violation_challan
    BEFORE INSERT ON violations
    FOR EACH ROW
    EXECUTE FUNCTION generate_challan_number();

-- Function to calculate fine based on beam intensity
CREATE OR REPLACE FUNCTION calculate_fine_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fine_amount IS NULL OR NEW.fine_amount = 1000.00 THEN
        IF NEW.beam_intensity > 80 THEN
            NEW.fine_amount := 2000.00;
        ELSIF NEW.beam_intensity > 60 THEN
            NEW.fine_amount := 1500.00;
        ELSE
            NEW.fine_amount := 1000.00;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_violation_fine
    BEFORE INSERT ON violations
    FOR EACH ROW
    EXECUTE FUNCTION calculate_fine_amount();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy for service role (full access)
CREATE POLICY "Service role has full access to vehicles" ON vehicles
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to violations" ON violations
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to payments" ON payments
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to detection_logs" ON detection_logs
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to admins" ON admins
    FOR ALL USING (true);

CREATE POLICY "Service role has full access to notifications" ON notifications
    FOR ALL USING (true);

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample vehicles
INSERT INTO vehicles (vehicle_number, owner_name, owner_dob, phone_number, email) VALUES
('MH12AB1234', 'Rajesh Kumar', '1990-01-15', '+919876543210', 'rajesh@example.com'),
('MH14CD5678', 'Priya Sharma', '1985-06-20', '+919876543211', 'priya@example.com'),
('MH01EF9012', 'Amit Patel', '1992-03-10', '+919876543212', 'amit@example.com')
ON CONFLICT (vehicle_number) DO NOTHING;

-- Insert sample violations
INSERT INTO violations (vehicle_number, beam_intensity, ai_confidence, latitude, longitude, location_address, camera_id, status) VALUES
('MH12AB1234', 85, 0.95, 19.0760, 72.8777, 'Marine Drive, Mumbai', 'CAM-001', 'approved'),
('MH12AB1234', 72, 0.88, 19.0596, 72.8295, 'Bandra Worli Sea Link', 'CAM-003', 'paid'),
('MH14CD5678', 92, 0.97, 19.0728, 72.8826, 'Eastern Express Highway', 'CAM-007', 'pending')
ON CONFLICT (challan_number) DO NOTHING;
