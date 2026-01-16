-- =====================================================
-- STUDENT AUTHENTICATION SETUP
-- Liceo de Cagayan University - Complaint System
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. Create students table for storing student profiles
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  student_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for students table
-- Policy: Students can read their own profile
CREATE POLICY "Students can read own profile" ON students
  FOR SELECT
  USING (auth.email() = email);

-- Policy: Students can update their own profile
CREATE POLICY "Students can update own profile" ON students
  FOR UPDATE
  USING (auth.email() = email);

-- Policy: Allow insert for authenticated users (for auto-creation on first login)
CREATE POLICY "Allow insert for authenticated users" ON students
  FOR INSERT
  WITH CHECK (auth.email() = email);

-- Policy: Service role can do everything (for backend operations)
CREATE POLICY "Service role full access" ON students
  FOR ALL
  TO service_role
  USING (true);

-- 5. Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for students updated_at
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_students_updated_at();

-- =====================================================
-- VERIFICATION
-- =====================================================
-- SELECT * FROM students;
