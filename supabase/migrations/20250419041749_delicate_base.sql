/*
  # Add INSERT policy for user_stats table

  1. Security Changes
    - Add INSERT policy to user_stats table allowing users to create their own stats
    - Policy ensures users can only create stats entries for themselves
*/

CREATE POLICY "Users can create their own stats"
  ON user_stats
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);