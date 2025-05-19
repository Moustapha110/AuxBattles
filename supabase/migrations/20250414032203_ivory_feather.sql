/*
  # Create battles table and related schemas

  1. New Tables
    - `battles`
      - `id` (uuid, primary key)
      - `code` (text, unique, 7 characters)
      - `theme` (text)
      - `category` (text)
      - `host_id` (uuid, references auth.users)
      - `max_players` (int, default 8)
      - `status` (text, default 'waiting')
      - `created_at` (timestamp)
    - `battle_players`
      - `battle_id` (uuid, references battles)
      - `user_id` (uuid, references auth.users)
      - `is_host` (boolean)
      - `joined_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for battle creation and joining
*/

-- Create battles table
CREATE TABLE battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL CHECK (char_length(code) = 7),
  theme text NOT NULL,
  category text NOT NULL,
  host_id uuid REFERENCES auth.users NOT NULL,
  max_players int NOT NULL DEFAULT 8,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz DEFAULT now()
);

-- Create battle_players table
CREATE TABLE battle_players (
  battle_id uuid REFERENCES battles ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  is_host boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (battle_id, user_id)
);

-- Enable RLS
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_players ENABLE ROW LEVEL SECURITY;

-- Policies for battles table
CREATE POLICY "Anyone can view active battles"
  ON battles
  FOR SELECT
  USING (status = 'waiting');

CREATE POLICY "Users can create battles"
  ON battles
  FOR INSERT
  WITH CHECK (auth.uid() = host_id);

-- Policies for battle_players table
CREATE POLICY "Players can view battle participants"
  ON battle_players
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM battle_players bp
    WHERE bp.battle_id = battle_players.battle_id
    AND bp.user_id = auth.uid()
  ));

CREATE POLICY "Players can join battles"
  ON battle_players
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM battles b
      WHERE b.id = battle_id
      AND b.status = 'waiting'
      AND (
        SELECT COUNT(*) FROM battle_players bp
        WHERE bp.battle_id = battle_id
      ) < b.max_players
    )
  );