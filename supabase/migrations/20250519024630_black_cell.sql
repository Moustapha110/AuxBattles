/*
  # Create battle with host stored procedure

  1. Changes
    - Create a stored procedure to handle battle and player creation atomically
    - Return the created battle details
    - Add security definer to ensure proper permissions

  2. Security
    - Function runs with definer's permissions
    - Input validation included
*/

CREATE OR REPLACE FUNCTION create_battle_with_host(
  p_code TEXT,
  p_theme TEXT,
  p_category TEXT,
  p_host_id UUID
)
RETURNS battles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_battle battles;
BEGIN
  -- Input validation
  IF p_code IS NULL OR p_theme IS NULL OR p_category IS NULL OR p_host_id IS NULL THEN
    RAISE EXCEPTION 'All parameters are required';
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
  RETURNING * INTO v_battle;

  -- Add the host as a player
  INSERT INTO battle_players (
    battle_id,
    user_id,
    is_host
  ) VALUES (
    v_battle.id,
    p_host_id,
    true
  );

  RETURN v_battle;
END;
$$;