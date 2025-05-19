/*
  # Fix player loading and profile access

  1. Changes
    - Add index on battle_players.user_id for better join performance
    - Update battle_players select policy to properly handle participant visibility
    - Add policy for profiles to allow battle participants to view each other's profiles
    - Ensure proper foreign key constraints

  2. Security
    - Maintain RLS enabled on all tables
    - Ensure proper access control for battle participants
*/

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS idx_battle_players_user_id ON battle_players(user_id);

-- Update the battle_players select policy
DROP POLICY IF EXISTS "Players can view battle participants" ON battle_players;
CREATE POLICY "Players can view battle participants" ON battle_players
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM battle_players bp
    WHERE bp.battle_id = battle_players.battle_id
    AND bp.user_id = auth.uid()
  )
);

-- Add policy for profiles to allow battle participants to view profiles
DROP POLICY IF EXISTS "Battle participants can view profiles" ON profiles;
CREATE POLICY "Battle participants can view profiles" ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM battle_players bp
    WHERE bp.user_id = profiles.id
    AND EXISTS (
      SELECT 1 
      FROM battle_players viewer
      WHERE viewer.battle_id = bp.battle_id
      AND viewer.user_id = auth.uid()
    )
  )
);

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