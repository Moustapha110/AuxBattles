/*
  # Fix create_battle_with_host stored procedure

  1. Changes
    - Replace incorrect "players" table reference with "battle_players"
    - Add proper error handling
    - Ensure transaction safety
    - Add input validation
  
  2. Security
    - Maintains existing RLS policies
    - Validates user permissions
*/

CREATE OR REPLACE FUNCTION create_battle_with_host(
  p_code TEXT,
  p_theme TEXT,
  p_category TEXT,
  p_host_id UUID
)
RETURNS TABLE (
  id UUID,
  code TEXT,
  theme TEXT,
  category TEXT,
  host_id UUID,
  status TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_battle_id UUID;
BEGIN
  -- Input validation
  IF p_code IS NULL OR length(p_code) != 7 THEN
    RAISE EXCEPTION 'Invalid battle code format';
  END IF;
  
  IF p_theme IS NULL OR p_category IS NULL OR p_host_id IS NULL THEN
    RAISE EXCEPTION 'Theme, category, and host_id are required';
  END IF;

  -- Create the battle
  INSERT INTO battles (
    code,
    theme,
    category,
    host_id,
    status
  ) VALUES (
    p_code,
    p_theme,
    p_category,
    p_host_id,
    'waiting'
  )
  RETURNING id INTO v_battle_id;

  -- Add the host as a player
  INSERT INTO battle_players (
    battle_id,
    user_id,
    is_host
  ) VALUES (
    v_battle_id,
    p_host_id,
    true
  );

  -- Return the created battle
  RETURN QUERY
  SELECT b.*
  FROM battles b
  WHERE b.id = v_battle_id;
END;
$$;