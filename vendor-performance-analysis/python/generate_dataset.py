"""Dataset generator for expanding the vendor analytics demo.

The committed CSV is intentionally small enough to review in GitHub. This
script shows how the same project can be scaled to a larger synthetic dataset.
"""

from pathlib import Path
import random

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "vendor_performance_generated.csv"

CATEGORIES = ["Electronics", "Grocery", "Healthcare", "Industrial", "Apparel", "Packaging"]
REGIONS = ["North", "South", "East", "West"]


def main(rows: int = 150) -> None:
    random.seed(42)
    records = []

    for index in range(rows):
        revenue = random.randint(420_000, 3_200_000)
        cost = int(revenue * random.uniform(0.58, 0.84))
        stock_value = random.randint(100_000, 850_000)
        records.append(
            {
                "vendor_id": f"SIM-{index + 1:03}",
                "vendor_name": f"Simulated Vendor {index + 1:03}",
                "category": random.choice(CATEGORIES),
                "region": random.choice(REGIONS),
                "revenue": revenue,
                "cost": cost,
                "stock_value": stock_value,
                "unsold_stock_value": int(stock_value * random.uniform(0.08, 0.52)),
                "units_sold": random.randint(4_000, 32_000),
                "units_received": random.randint(6_000, 36_000),
                "on_time_delivery_pct": round(random.uniform(72, 99), 1),
                "defect_rate_pct": round(random.uniform(0.4, 5.8), 1),
                "lead_time_days": random.randint(6, 31),
                "return_rate_pct": round(random.uniform(0.6, 7.0), 1),
                "po_count": random.randint(24, 92),
                "contract_risk_score": random.randint(10, 82),
                "payment_terms_days": random.choice([15, 30, 45, 60]),
            }
        )

    pd.DataFrame(records).to_csv(OUTPUT, index=False)
    print(f"Generated {rows} rows at {OUTPUT}")


if __name__ == "__main__":
    main()
