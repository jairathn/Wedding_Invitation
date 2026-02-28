-- Wedding App Database Schema
-- Run this against your Neon Postgres database

-- Guests table (app-specific data for guests from the master list)
CREATE TABLE IF NOT EXISTS guests (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  email VARCHAR(255),
  phone VARCHAR(50),
  drive_folder_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(first_name, last_name)
);

-- Sessions (one per guest per device)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id INTEGER REFERENCES guests(id),
  device_type VARCHAR(20),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Uploads (every video and photo)
CREATE TABLE IF NOT EXISTS uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id INTEGER REFERENCES guests(id),
  session_id UUID REFERENCES sessions(id),
  event VARCHAR(50) NOT NULL,
  media_type VARCHAR(10) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  drive_file_id VARCHAR(255),
  drive_folder_id VARCHAR(255),
  upload_status VARCHAR(20) DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  local_blob_url TEXT,
  filter_applied VARCHAR(100),
  prompt_answered VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  uploaded_at TIMESTAMP
);

-- AI Processing Jobs (Phase 2)
CREATE TABLE IF NOT EXISTS ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id INTEGER REFERENCES guests(id),
  job_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  input_upload_ids UUID[],
  output_drive_file_id VARCHAR(255),
  output_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Email Delivery Log
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id INTEGER REFERENCES guests(id),
  email_type VARCHAR(50),
  sent_to VARCHAR(255),
  status VARCHAR(20),
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  venue_name VARCHAR(200),
  venue_address TEXT,
  start_time TIME,
  end_time TIME,
  sort_order INTEGER
);

-- Seed events (only if not already present)
INSERT INTO events (slug, name, date, venue_name, description, sort_order) VALUES
  ('haldi', 'Haldi (Pithi)', '2026-09-09', 'Hotel Estela', 'A joyful ceremony of turmeric blessings and celebration.', 1),
  ('sangeet', 'Sangeet', '2026-09-10', 'Xalet', 'An evening of music, dance, and Bollywood glamour.', 2),
  ('wedding_reception', 'Wedding Ceremony & Reception', '2026-09-11', 'TBD', 'The main event — ceremony, celebration, and dancing into the night.', 3)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_uploads_guest_id ON uploads(guest_id);
CREATE INDEX IF NOT EXISTS idx_uploads_event ON uploads(event);
CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(upload_status);
CREATE INDEX IF NOT EXISTS idx_sessions_guest_id ON sessions(guest_id);
