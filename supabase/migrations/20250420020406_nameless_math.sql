/*
  # Fix battle_players RLS policy

  1. Changes
    - Drop existing INSERT policy for battle_players
    - Create new INSERT policy with fixed conditions to avoid recursion
  
  2. Security
    - Maintain RLS enabled on battle_players table
    - New policy ensures players can only join battles that:
      a) Are in 'waiting' status
      b) Have not reached max_players limit
*/

-- Drop the existing policy that's causing recursion
DROP POLICY IF EXISTS "Players can join battles" ON battle_players;

-- Create new policy with fixed conditions
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