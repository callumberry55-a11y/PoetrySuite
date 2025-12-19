/*
  # Create Custom Themes Table

  1. New Tables
    - `custom_themes`
      - `id` (uuid, primary key) - Unique theme identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `name` (text) - Theme name
      - `primary_color` (text) - Primary color hex code
      - `secondary_color` (text) - Secondary color hex code
      - `accent_color` (text) - Accent color hex code
      - `background_color` (text) - Background color hex code
      - `surface_color` (text) - Surface color hex code
      - `text_color` (text) - Text color hex code
      - `is_active` (boolean) - Whether this theme is currently active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `custom_themes` table
    - Add policy for users to read their own themes
    - Add policy for users to create their own themes
    - Add policy for users to update their own themes
    - Add policy for users to delete their own themes

  3. Indexes
    - Index on user_id for faster queries
    - Index on user_id and is_active for finding active theme
*/

CREATE TABLE IF NOT EXISTS custom_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  primary_color text NOT NULL,
  secondary_color text NOT NULL,
  accent_color text NOT NULL,
  background_color text NOT NULL,
  surface_color text NOT NULL,
  text_color text NOT NULL,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE custom_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own custom themes"
  ON custom_themes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own custom themes"
  ON custom_themes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom themes"
  ON custom_themes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom themes"
  ON custom_themes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_custom_themes_user_id ON custom_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_themes_user_active ON custom_themes(user_id, is_active) WHERE is_active = true;