CREATE TABLE vendors (
  vendor_id VARCHAR(20) PRIMARY KEY,
  vendor_name VARCHAR(120) NOT NULL,
  category VARCHAR(60) NOT NULL,
  region VARCHAR(40) NOT NULL,
  revenue DECIMAL(14, 2) NOT NULL,
  cost DECIMAL(14, 2) NOT NULL,
  stock_value DECIMAL(14, 2) NOT NULL,
  unsold_stock_value DECIMAL(14, 2) NOT NULL,
  units_sold INT NOT NULL,
  units_received INT NOT NULL,
  on_time_delivery_pct DECIMAL(5, 2) NOT NULL,
  defect_rate_pct DECIMAL(5, 2) NOT NULL,
  lead_time_days INT NOT NULL,
  return_rate_pct DECIMAL(5, 2) NOT NULL,
  po_count INT NOT NULL,
  contract_risk_score INT NOT NULL,
  payment_terms_days INT NOT NULL
);

CREATE TABLE monthly_vendor_trends (
  month DATE NOT NULL,
  vendor_id VARCHAR(20) NOT NULL REFERENCES vendors(vendor_id),
  revenue DECIMAL(14, 2) NOT NULL,
  stock_value DECIMAL(14, 2) NOT NULL,
  unsold_stock_value DECIMAL(14, 2) NOT NULL,
  on_time_delivery_pct DECIMAL(5, 2) NOT NULL,
  defect_rate_pct DECIMAL(5, 2) NOT NULL,
  PRIMARY KEY (month, vendor_id)
);
