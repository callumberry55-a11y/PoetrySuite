/*
  # Create AI Wallpapers Table

  1. New Tables
    - `ai_wallpapers`
      - `id` (uuid, primary key) - Unique wallpaper identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `name` (text) - Wallpaper name/description
      - `prompt` (text) - AI prompt used to find/describe the wallpaper
      - `image_url` (text) - URL to the wallpaper image
      - `thumbnail_url` (text) - URL to thumbnail version
      - `source` (text) - Image source (pexels, unsplash, etc)
      - `is_active` (boolean) - Whether this wallpaper is currently active
      - `blur_amount` (integer) - Blur effect strength (0-10)
      - `opacity` (integer) - Opacity level (0-100)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `ai_wallpapers` table
    - Add policy for users to read their own wallpapers
    - Add policy for users to create their own wallpapers
    - Add policy for users to update their own wallpapers
    - Add policy for users to delete their own wallpapers

  3. Indexes
    - Index on user_id for faster queries
    - Index on user_id and is_active for finding active wallpaper
*/

CREATE TABLE IF NOT EXISTS ai_wallpapers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  prompt text DEFAULT '',
  image_url text NOT NULL,
  thumbnail_url text DEFAULT '',
  source text DEFAULT 'pexels',
  is_active boolean DEFAULT false,
  blur_amount integer DEFAULT 0 CHECK (blur_amount >= 0 AND blur_amount <= 10),
  opacity integer DEFAULT 100 CHECK (opacity >= 0 AND opacity <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_wallpapers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI wallpapers"
  ON ai_wallpapers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own AI wallpapers"
  ON ai_wallpapers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI wallpapers"
  ON ai_wallpapers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI wallpapers"
  ON ai_wallpapers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_wallpapers_user_id ON ai_wallpapers(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_wallpapers_user_active ON ai_wallpapers(user_id, is_active) WHERE is_active = true;