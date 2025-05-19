/*
  # Fix battle_players policy recursion

  1. Changes
    - Drop existing policy that causes recursion
    - Create new optimized policy for battle_players table that:
      a) Checks battle status directly
      b) Verifies player count without recursive checks
      c) Maintains security while avoiding infinite loops

  2. Security
    - Maintains same security rules:
      - Only allows joining 'waiting' battles
      - Enforces max player limits
      - Prevents joining full battles
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
    WHERE b.id = battle_players.battle_id
    AND b.status = 'waiting'
    AND (
      SELECT COUNT(*)
      FROM battle_players bp
      WHERE bp.battle_id = b.id
    ) < b.max_players
  )
);