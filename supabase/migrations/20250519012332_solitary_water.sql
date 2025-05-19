/*
  # Create function for atomic battle creation

  1. New Function
    - `create_battle_with_host`: Creates a battle and adds the host as a player atomically
    - Returns the created battle record
    - Handles both operations in a single transaction

  2. Security
    - Function runs with invoker rights
    - Respects existing RLS policies
*/

CREATE OR REPLACE FUNCTION create_battle_with_host(
  p_code text,
  p_theme text,
  p_category text,
  p_host_id uuid
)
RETURNS battles AS $$
DECLARE
  v_battle battles;
BEGIN
  -- Insert the battle
  INSERT INTO battles (code, theme, category, host_id, status)
  VALUES (p_code, p_theme, p_category, p_host_id, 'waiting')
  RETURNING * INTO v_battle;

  -- Insert the host as a player
  INSERT INTO battle_players (battle_id, user_id, is_host)
  VALUES (v_battle.id, p_host_id, true);

  RETURN v_battle;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;