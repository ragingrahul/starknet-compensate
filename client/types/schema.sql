-- 1. Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_wallet_address TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  payroll_contract_address TEXT,
  token_contract_address TEXT,
  verifier_contract_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  starknet_wallet_address TEXT NOT NULL,
  role TEXT,
  department TEXT,
  salary NUMERIC NOT NULL,
  secret_hash TEXT NOT NULL,
  leaf_nonce_counter INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Payroll periods
CREATE TABLE payroll_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  period_id TEXT NOT NULL,
  label TEXT,
  merkle_root TEXT NOT NULL,
  total_gross TEXT NOT NULL,
  state TEXT DEFAULT 'draft',
  commit_tx_hash TEXT,
  fund_tx_hash TEXT,
  freeze_tx_hash TEXT,
  close_tx_hash TEXT,
  committed_at TIMESTAMPTZ,
  funded_at TIMESTAMPTZ,
  frozen_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, period_id)
);

-- 4. Period leaves
CREATE TABLE period_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES payroll_periods(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id),
  leaf_index INTEGER NOT NULL,
  leaf_hash TEXT NOT NULL,
  amount TEXT NOT NULL,
  nonce INTEGER NOT NULL,
  recipient_commitment TEXT NOT NULL,
  path_elements JSONB NOT NULL,
  path_indices JSONB NOT NULL,
  -- Shielded pool: L2 Merkle path (leaf company_root → global_root)
  path_L2_elements JSONB,
  path_L2_indices  JSONB,
  global_root      TEXT,
  claimed BOOLEAN DEFAULT false,
  claim_tx_hash TEXT,
  nullifier_hash TEXT,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Employee invites
CREATE TABLE employee_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  invite_token TEXT NOT NULL UNIQUE,
  encrypted_secret TEXT NOT NULL,
  salt TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Pool global roots (coordinator's batched L2 tree commitments)
CREATE TABLE pool_global_roots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root         TEXT NOT NULL UNIQUE,
  member_roots JSONB NOT NULL DEFAULT '[]',
  on_chain_tx  TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 7. Pool submitted roots (company → coordinator)
CREATE TABLE pool_submitted_roots (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id           UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  period_db_id         UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
  period_on_chain_id   TEXT NOT NULL,
  root                 TEXT NOT NULL,
  total_amount         TEXT NOT NULL,
  token_address        TEXT NOT NULL,
  deposit_tx_hash      TEXT,
  pool_global_root_id  UUID REFERENCES pool_global_roots(id),
  l2_leaf_index        INTEGER,
  created_at           TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE companies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees           ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods     ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_leaves       ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_invites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_global_roots   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_submitted_roots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON companies
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON employees
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON payroll_periods
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON period_leaves
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON employee_invites
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON pool_global_roots
  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON pool_submitted_roots
  FOR ALL USING (true) WITH CHECK (true);
