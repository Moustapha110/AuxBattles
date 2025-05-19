/*
  # Add session joining functionality

  1. Changes
    - Add index on session_id for better performance
    - Update RLS policies to allow session joining
    - Add policy for viewing session participants

  2. Security
    - Maintain RLS enabled
    - Allow public access to active sessions
*/

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_session_players_session_id ON session_players(session_id);

-- Update session_players select policy
DROP POLICY IF EXISTS "Players can view session participants" ON session_players;
CREATE POLICY "Players can view session participants" ON session_players
FOR SELECT
TO public
USING (true);

-- Update insert policy for session_players
DROP POLICY IF EXISTS "Users can join sessions" ON session_players;
CREATE POLICY "Users can join sessions" ON session_players
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM battle_sessions s
    WHERE s.id = session_players.session_id
    AND s.status = 'waiting'
  )
);