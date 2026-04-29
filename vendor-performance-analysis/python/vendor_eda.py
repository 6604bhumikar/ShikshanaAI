"""Vendor Performance Analysis EDA.

Run from the project root:
    python python/vendor_eda.py

The script reads the CSV data, engineers business metrics, and exports a
review-ready Excel workbook that can feed Power BI or stakeholder analysis.
"""

from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "vendor_performance.csv"
OUTPUT = ROOT / "excel" / "vendor_performance_model.xlsx"


def score_vendor(row: pd.Series) -> str:
    unsold_pct = row["unsold_stock_value"] / row["stock_value"]
    margin_pct = row["gross_profit"] / row["revenue"]

    if row["contract_risk_score"] >= 65 or row["on_time_delivery_pct"] < 80:
        return "Renegotiate / alternate supplier"
    if unsold_pct >= 0.35 and margin_pct < 0.25:
        return "Cut reorder volume"
    if row["on_time_delivery_pct"] >= 95 and row["defect_rate_pct"] <= 1.5:
        return "Preferred vendor"
    return "Monitor with next PO cycle"


def main() -> None:
    vendors = pd.read_csv(DATA)
    vendors["gross_profit"] = vendors["revenue"] - vendors["cost"]
    vendors["gross_margin_pct"] = vendors["gross_profit"] / vendors["revenue"]
    vendors["unsold_stock_pct"] = vendors["unsold_stock_value"] / vendors["stock_value"]
    vendors["sell_through_pct"] = vendors["units_sold"] / vendors["units_received"]
    vendors["capital_efficiency"] = vendors["revenue"] / vendors["stock_value"]
    vendors["recommendation"] = vendors.apply(score_vendor, axis=1)

    category = (
        vendors.groupby("category", as_index=False)
        .agg(
            revenue=("revenue", "sum"),
            gross_profit=("gross_profit", "sum"),
            unsold_stock_value=("unsold_stock_value", "sum"),
            avg_on_time_delivery=("on_time_delivery_pct", "mean"),
            avg_defect_rate=("defect_rate_pct", "mean"),
        )
        .sort_values("revenue", ascending=False)
    )

    region = (
        vendors.groupby("region", as_index=False)
        .agg(
            vendor_count=("vendor_id", "count"),
            revenue=("revenue", "sum"),
            unsold_stock_value=("unsold_stock_value", "sum"),
            avg_contract_risk=("contract_risk_score", "mean"),
        )
        .sort_values("revenue", ascending=False)
    )

    OUTPUT.parent.mkdir(exist_ok=True)
    with pd.ExcelWriter(OUTPUT, engine="openpyxl") as writer:
      vendors.to_excel(writer, index=False, sheet_name="Vendor Scorecard")
      category.to_excel(writer, index=False, sheet_name="Category Summary")
      region.to_excel(writer, index=False, sheet_name="Region Summary")

    print(f"Rows analyzed: {len(vendors)}")
    print(f"Unsold capital: ${vendors['unsold_stock_value'].sum():,.0f}")
    print(f"Excel model written to: {OUTPUT}")


if __name__ == "__main__":
    main()
