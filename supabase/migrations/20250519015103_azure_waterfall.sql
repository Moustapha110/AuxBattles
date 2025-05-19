/*
  # Fix battle players and profiles relationship

  1. Changes
    - Add foreign key constraint from battle_players to profiles
    - Update policies to allow proper access to profiles data
    - Add index for better query performance

  2. Security
    - Maintain RLS enabled on both tables
    - Add policy for viewing profiles of battle participants
*/

-- Drop existing foreign key if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'battle_players_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE battle_players DROP CONSTRAINT battle_players_user_id_profiles_fkey;
  END IF;
END $$;

-- Add foreign key constraint
ALTER TABLE battle_players
ADD CONSTRAINT battle_players_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add index for better join performance
CREATE INDEX IF NOT EXISTS idx_battle_players_user_id ON battle_players(user_id);

-- Update the battle_players select policy
DROP POLICY IF EXISTS "Players can view battle participants" ON battle_players;

CREATE POLICY "Players can view battle participants"
ON battle_players
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM battle_players bp
    WHERE bp.battle_id = battle_players.battle_id
    AND bp.user_id = auth.uid()
  )
);

-- Add policy for profiles to allow battle participants to view
DROP POLICY IF EXISTS "Battle participants can view profiles" ON profiles;

CREATE POLICY "Battle participants can view profiles"
ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM battle_players bp
    WHERE bp.user_id = id
    AND EXISTS (
      SELECT 1 FROM battle_players viewer
      WHERE viewer.battle_id = bp.battle_id
      AND viewer.user_id = auth.uid()
    )
  )
);