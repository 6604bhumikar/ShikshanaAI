-- Vendor profitability and unsold capital exposure
SELECT
  vendor_id,
  vendor_name,
  category,
  region,
  revenue,
  revenue - cost AS gross_profit,
  ROUND((revenue - cost) * 100.0 / NULLIF(revenue, 0), 2) AS gross_margin_pct,
  unsold_stock_value,
  ROUND(unsold_stock_value * 100.0 / NULLIF(stock_value, 0), 2) AS unsold_stock_pct
FROM vendors
ORDER BY unsold_stock_value DESC;

-- Operational risk ranking for vendor negotiations
SELECT
  vendor_name,
  on_time_delivery_pct,
  defect_rate_pct,
  return_rate_pct,
  lead_time_days,
  contract_risk_score,
  CASE
    WHEN contract_risk_score >= 65 OR on_time_delivery_pct < 80 THEN 'Renegotiate or replace'
    WHEN unsold_stock_value * 1.0 / NULLIF(stock_value, 0) > 0.35 THEN 'Reduce order quantity'
    WHEN on_time_delivery_pct >= 95 AND defect_rate_pct < 1.5 THEN 'Preferred vendor'
    ELSE 'Monitor'
  END AS recommendation
FROM vendors
ORDER BY contract_risk_score DESC, on_time_delivery_pct ASC;

-- Month-over-month signal for Power BI trend pages
WITH monthly AS (
  SELECT
    month,
    vendor_id,
    revenue,
    unsold_stock_value,
    LAG(revenue) OVER (PARTITION BY vendor_id ORDER BY month) AS previous_revenue,
    LAG(unsold_stock_value) OVER (PARTITION BY vendor_id ORDER BY month) AS previous_unsold
  FROM monthly_vendor_trends
)
SELECT
  month,
  vendor_id,
  revenue,
  revenue - previous_revenue AS revenue_delta,
  unsold_stock_value,
  unsold_stock_value - previous_unsold AS unsold_capital_delta
FROM monthly
WHERE previous_revenue IS NOT NULL;
