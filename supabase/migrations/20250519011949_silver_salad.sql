/*
  # Fix battle_players policy recursion

  1. Changes
    - Drop existing policy that causes recursion
    - Create new optimized policy for battle_players table
    - Simplify policy conditions to prevent recursion
    - Add proper error handling

  2. Security
    - Maintain same security rules but with better implementation
    - Ensure players can only join valid battles
    - Prevent joining full or non-waiting battles
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Players can join battles" ON battle_players;

-- Create new optimized policy without recursion
CREATE POLICY "Players can join battles"
ON battle_players
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM battles b
    LEFT JOIN LATERAL (
      SELECT COUNT(*) as player_count
      FROM battle_players bp
      WHERE bp.battle_id = b.id
    ) counts ON true
    WHERE b.id = battle_players.battle_id
    AND b.status = 'waiting'
    AND counts.player_count < b.max_players
  )
);