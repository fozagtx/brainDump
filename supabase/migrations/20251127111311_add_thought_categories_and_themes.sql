/*
  # Update thoughts table for categorization

  1. Changes
    - Add `category` column to thoughts table (worry, future, rumination, other)
    - Add `theme` column for grouping similar thoughts
    - Add `color` column for bubble visualization
    - Update sessions table to store overall reflection

  2. Notes
    - These changes allow for better thought organization and visualization
    - Supports the bubble view with filtering by category
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'thoughts' AND column_name = 'category'
  ) THEN
    ALTER TABLE thoughts ADD COLUMN category text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'thoughts' AND column_name = 'theme'
  ) THEN
    ALTER TABLE thoughts ADD COLUMN theme text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'thoughts' AND column_name = 'color'
  ) THEN
    ALTER TABLE thoughts ADD COLUMN color text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sessions' AND column_name = 'overall_reflection'
  ) THEN
    ALTER TABLE sessions ADD COLUMN overall_reflection text;
  END IF;
END $$;