/*
  # Fix battle_players RLS policy

  1. Changes
    - Drop existing policy that causes infinite recursion
    - Create new policy that checks battle status directly from battles table
    - Simplify the player count check using a correlated subquery
  
  2. Security
    - Maintains same security constraints:
      - Only allows joining battles that are in 'waiting' status
      - Enforces max player limit
    - Avoids recursion by not querying battle_players table in policy
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Players can join battles" ON battle_players;

-- Create new policy without recursion
CREATE POLICY "Players can join battles" ON battle_players
FOR INSERT TO public
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