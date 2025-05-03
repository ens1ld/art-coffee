-- Create the favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only favorite a product once
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Set up Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to select their own favorites
CREATE POLICY select_own_favorites ON favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own favorites
CREATE POLICY insert_own_favorites ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own favorites
CREATE POLICY delete_own_favorites ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX favorites_user_id_idx ON favorites (user_id);
CREATE INDEX favorites_product_id_idx ON favorites (product_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, DELETE ON favorites TO authenticated; 