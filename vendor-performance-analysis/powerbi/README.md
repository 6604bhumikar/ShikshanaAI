# Power BI Model Notes

Recommended model:

- `vendors[vendor_id]` one-to-many `monthly_vendor_trends[vendor_id]`
- Date table related to `monthly_vendor_trends[month]`
- Slicers: Region, Category, Recommendation, Month

Core DAX measures:

```DAX
Revenue = SUM(vendors[revenue])

Gross Profit = SUM(vendors[revenue]) - SUM(vendors[cost])

Gross Margin % = DIVIDE([Gross Profit], [Revenue])

Unsold Capital = SUM(vendors[unsold_stock_value])

Unsold Stock % = DIVIDE(SUM(vendors[unsold_stock_value]), SUM(vendors[stock_value]))

Sell Through % = DIVIDE(SUM(vendors[units_sold]), SUM(vendors[units_received]))

Risk Weighted Capital =
SUMX(vendors, vendors[unsold_stock_value] * vendors[contract_risk_score] / 100)

Preferred Vendor Count =
CALCULATE(COUNTROWS(vendors), vendors[on_time_delivery_pct] >= 95, vendors[defect_rate_pct] <= 1.5)
```

Dashboard pages:

- Executive Overview: KPI cards, category revenue, unsold capital, recommendation mix.
- Vendor Deep Dive: scatter plot of margin vs unsold stock %, conditional risk table.
- Trend Monitor: monthly revenue vs unsold capital deltas for selected vendors.
- Action Plan: reorder reductions, negotiation targets, and preferred vendor expansion.
