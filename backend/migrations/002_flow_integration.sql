-- Flow integration tables
CREATE TABLE IF NOT EXISTS flow_wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL UNIQUE,
  provider TEXT,
  network TEXT DEFAULT 'testnet',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flow_wallets_user_id ON flow_wallets(user_id);

CREATE TABLE IF NOT EXISTS flow_assets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  contract_name TEXT,
  contract_address TEXT,
  token_id TEXT,
  metadata JSON,
  preview_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flow_assets_user_id ON flow_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_flow_assets_wallet ON flow_assets(wallet_address);

CREATE TABLE IF NOT EXISTS flow_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  tx_id TEXT NOT NULL UNIQUE,
  action TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  error TEXT,
  payload JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flow_tx_user_id ON flow_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_flow_tx_wallet ON flow_transactions(wallet_address);

