/*
  # Fix battle loading and subscription issues

  1. Changes
    - Add index on battles.code for faster lookups
    - Add index on battle_players.battle_id for faster joins
    - Add policy for battle status updates
*/

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS battles_code_idx ON battles(code);
CREATE INDEX IF NOT EXISTS battle_players_battle_id_idx ON battle_players(battle_id);

-- Add policy for battle status updates
CREATE POLICY "Host can update battle status"
ON battles
FOR UPDATE
USING (auth.uid() = host_id)
WITH CHECK (
  auth.uid() = host_id AND
  status = 'in_progress' AND
  EXISTS (
    SELECT 1 FROM battle_players
    WHERE battle_id = id
    GROUP BY battle_id
    HAVING COUNT(*) >= 2
  )
);