/*
  # Fix foreign key relationship between battle_players and profiles

  1. Changes
    - Add foreign key constraint from battle_players.user_id to profiles.id
    - Update RLS policies to ensure proper access control
*/

-- Add foreign key constraint
ALTER TABLE battle_players
ADD CONSTRAINT battle_players_user_id_profiles_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;

-- Update the battle_players select policy to include profile access
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
CREATE POLICY "Battle participants can view profiles"
ON profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM battle_players bp
    WHERE bp.user_id = profiles.id
    AND EXISTS (
      SELECT 1 FROM battle_players viewer
      WHERE viewer.battle_id = bp.battle_id
      AND viewer.user_id = auth.uid()
    )
  )
);