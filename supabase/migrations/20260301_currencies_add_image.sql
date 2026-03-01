-- Add optional image_url column to currencies table
ALTER TABLE currencies ADD COLUMN IF NOT EXISTS image_url TEXT;
