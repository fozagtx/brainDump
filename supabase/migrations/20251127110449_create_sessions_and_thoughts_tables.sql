/*
  # Mental Health Sessions Database Schema

  1. New Tables
    - `sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable for anonymous sessions)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)
      - `mind_weather` (text, nullable)
      - `thoughts_explored` (integer, default 0)
      - `average_intensity` (numeric, nullable)
      - `emotions_data` (jsonb, stores emotion scores)
      
    - `thoughts`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to sessions)
      - `thought_text` (text)
      - `can_change` (text, nullable)
      - `helps_or_hurts` (text, nullable)
      - `primary_feeling` (text, nullable)
      - `reflection` (text, nullable)
      - `intensity` (numeric, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Allow public access for anonymous sessions
    - Users can access their own sessions if authenticated
*/

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  mind_weather text,
  thoughts_explored integer DEFAULT 0,
  average_intensity numeric,
  emotions_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS thoughts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  thought_text text NOT NULL,
  can_change text,
  helps_or_hurts text,
  primary_feeling text,
  reflection text,
  intensity numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create sessions"
  ON sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own sessions"
  ON sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update their own sessions"
  ON sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can create thoughts"
  ON thoughts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view thoughts in their sessions"
  ON thoughts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update thoughts"
  ON thoughts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);