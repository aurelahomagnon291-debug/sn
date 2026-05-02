-- Créer la table users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table login_attempts
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  password TEXT NOT NULL,
  status TEXT NOT NULL,
  ip_address TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security) mais permettre tout pour la démo
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre toutes les opérations (mode démo)
CREATE POLICY "Enable all operations for demo" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for demo" ON login_attempts
  FOR ALL USING (true) WITH CHECK (true);
