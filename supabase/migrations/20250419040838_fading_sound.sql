/*
  # Add extended statistics columns

  1. Changes
    - Add new columns to user_stats table:
      - longest_streak (integer)
      - favorite_category (text)
      - total_playtime (integer, in minutes)
      - average_score (float)

  2. Security
    - Existing RLS policies will cover the new columns
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_stats' AND column_name = 'longest_streak'
  ) THEN
    ALTER TABLE user_stats 
    ADD COLUMN longest_streak integer DEFAULT 0,
    ADD COLUMN favorite_category text,
    ADD COLUMN total_playtime integer DEFAULT 0,
    ADD COLUMN average_score float DEFAULT 0;
  END IF;
END $$;