-- ============================================
-- FIX DEPARTMENTS TABLE
-- ============================================
-- This script fixes the departments table by dropping and recreating it
-- with the correct schema including the 'code' column

-- Drop the existing departments table
DROP TABLE IF EXISTS departments CASCADE;

-- Recreate departments table with correct schema
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default departments
INSERT INTO departments (name, code, description, is_active) VALUES
  ('Academic Affairs', 'academic', 'Academic-related concerns and issues', true),
  ('Facilities Management', 'facilities', 'Building, equipment, and facility concerns', true),
  ('Finance Office', 'finance', 'Financial and payment-related matters', true),
  ('Staff Relations', 'staff', 'Staff behavior and conduct issues', true),
  ('Security Office', 'security', 'Safety and security concerns', true),
  ('Other', 'other', 'General concerns not covered by other categories', true)
ON CONFLICT (code) DO NOTHING;

-- Create indexes
CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_departments_active ON departments(is_active);
