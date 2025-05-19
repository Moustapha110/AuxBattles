/*
  # Fix battle_players RLS policy

  1. Changes
    - Drop the problematic policy that's causing infinite recursion
    - Create a new, simplified policy for inserting players that avoids recursion
    
  2. Security
    - Maintains RLS protection
    - Ensures players can only join battles that are in 'waiting' status
    - Ensures battles don't exceed max_players limit
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Players can join battles" ON battle_players;

-- Create new policy without recursion
CREATE POLICY "Players can join battles"
ON battle_players
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM battles b
    WHERE b.id = battle_players.battle_id
    AND b.status = 'waiting'
    AND (
      SELECT COUNT(*)
      FROM battle_players bp
      WHERE bp.battle_id = b.id
    ) < b.max_players
  )
);