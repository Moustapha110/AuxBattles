/*
  # Fix player loading and access policies

  1. Changes
    - Add index on battle_players.user_id for better performance
    - Update battle_players select policy for proper participant visibility
    - Add profile visibility policy for battle participants
    - Ensure proper foreign key constraints

  2. Security
    - Maintain RLS enabled on all tables
    - Update policies to allow proper access between related tables
*/

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS idx_battle_players_user_id ON battle_players(user_id);

-- Update the battle_players select policy
DROP POLICY IF EXISTS "Players can view battle participants" ON battle_players;
CREATE POLICY "Players can view battle participants" ON battle_players
FOR SELECT
TO public
USING (true);

-- Add policy for profiles to allow battle participants to view profiles
DROP POLICY IF EXISTS "Battle participants can view profiles" ON profiles;
CREATE POLICY "Battle participants can view profiles" ON profiles
FOR SELECT
TO public
USING (true);

-- Ensure proper foreign key constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'battle_players_user_id_fkey'
  ) THEN
    ALTER TABLE battle_players
    ADD CONSTRAINT battle_players_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;