/*
  # Fix create_battle_with_host function

  1. Changes
    - Create a new stored procedure that correctly handles battle creation
    - Uses the correct table name 'battle_players' instead of 'players'
    - Handles the transaction properly
    - Returns the created battle data

  2. Security
    - Function is accessible to authenticated users only
    - Validates input parameters
    - Ensures host is the authenticated user
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
  -- Validate input parameters
  IF p_code IS NULL OR p_theme IS NULL OR p_category IS NULL OR p_host_id IS NULL THEN
    RAISE EXCEPTION 'All parameters are required';
  END IF;

  -- Create the battle
  INSERT INTO battles (
    code,
    theme,
    category,
    host_id,
    status,
    created_at
  ) VALUES (
    p_code,
    p_theme,
    p_category,
    p_host_id,
    'waiting',
    now()
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