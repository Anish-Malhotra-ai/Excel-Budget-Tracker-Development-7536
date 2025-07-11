-- Create users table with RLS
CREATE TABLE users_wb23 (
  id VARCHAR PRIMARY KEY,
  auth_id UUID REFERENCES auth.users(id) NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users_wb23 ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
ON users_wb23
FOR SELECT
USING (auth.uid() = auth_id);

CREATE POLICY "Admin can view all profiles"
ON users_wb23
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users_wb23
    WHERE auth_id = auth.uid()
    AND role = 'admin'
  )
);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users_wb23
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create initial admin user
INSERT INTO users_wb23 (id, auth_id, email, full_name, role)
VALUES ('ADMIN001', auth.uid(), 'admin@example.com', 'System Admin', 'admin');

-- Update other tables to include user_id and RLS
ALTER TABLE categories_wb23 ADD COLUMN user_id VARCHAR REFERENCES users_wb23(id);
ALTER TABLE transactions_wb23 ADD COLUMN user_id VARCHAR REFERENCES users_wb23(id);

-- Add RLS policies for categories
CREATE POLICY "Users can manage their own categories"
ON categories_wb23
FOR ALL
USING (
  user_id IN (
    SELECT id FROM users_wb23
    WHERE auth_id = auth.uid()
  )
);

-- Add RLS policies for transactions
CREATE POLICY "Users can manage their own transactions"
ON transactions_wb23
FOR ALL
USING (
  user_id IN (
    SELECT id FROM users_wb23
    WHERE auth_id = auth.uid()
  )
);