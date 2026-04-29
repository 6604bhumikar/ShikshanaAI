const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1
});

const state = {
  vendors: [],
  scored: [],
  filters: {
    region: "All",
    category: "All",
    recommendation: "All",
    risk: 100,
    search: ""
  }
};

const colors = {
  "Preferred vendor": "#2f7d4f",
  "Monitor": "#345f9f",
  "Reduce order quantity": "#b38320",
  "Renegotiate or replace": "#d05f45"
};

const elements = {
  regionFilter: document.querySelector("#regionFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  recommendationFilter: document.querySelector("#recommendationFilter"),
  riskFilter: document.querySelector("#riskFilter"),
  searchInput: document.querySelector("#searchInput"),
  totalRevenue: document.querySelector("#totalRevenue"),
  revenueNote: document.querySelector("#revenueNote"),
  grossMargin: document.querySelector("#grossMargin"),
  unsoldCapital: document.querySelector("#unsoldCapital"),
  unsoldNote: document.querySelector("#unsoldNote"),
  deliveryHealth: document.querySelector("#deliveryHealth"),
  negotiationTarget: document.querySelector("#negotiationTarget"),
  preferredTarget: document.querySelector("#preferredTarget"),
  capitalRelease: document.querySelector("#capitalRelease"),
  vendorCount: document.querySelector("#vendorCount"),
  categoryBars: document.querySelector("#categoryBars"),
  quadrant: document.querySelector("#quadrant"),
  recommendationDonut: document.querySelector("#recommendationDonut"),
  vendorTable: document.querySelector("#vendorTable"),
  downloadCsv: document.querySelector("#downloadCsv")
};

fetch("./data/vendor_performance.csv")
  .then((response) => response.text())
  .then((csv) => {
    state.vendors = parseCsv(csv);
    state.scored = state.vendors.map(scoreVendor);
    hydrateFilters();
    applyUrlFilters();
    bindEvents();
    render();
  });

function parseCsv(csv) {
  const [headerLine, ...rows] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  const numericFields = new Set([
    "revenue",
    "cost",
    "stock_value",
    "unsold_stock_value",
    "units_sold",
    "units_received",
    "on_time_delivery_pct",
    "defect_rate_pct",
    "lead_time_days",
    "return_rate_pct",
    "po_count",
    "contract_risk_score",
    "payment_terms_days"
  ]);

  return rows.map((line) => {
    const values = line.split(",");
    return headers.reduce((record, header, index) => {
      record[header] = numericFields.has(header) ? Number(values[index]) : values[index];
      return record;
    }, {});
  });
}

function scoreVendor(vendor) {
  const grossProfit = vendor.revenue - vendor.cost;
  const grossMarginPct = grossProfit / vendor.revenue;
  const unsoldPct = vendor.unsold_stock_value / vendor.stock_value;
  const sellThroughPct = vendor.units_sold / vendor.units_received;
  const capitalEfficiency = vendor.revenue / vendor.stock_value;
  const riskComposite = Math.round(
    vendor.contract_risk_score * 0.42 +
      (100 - vendor.on_time_delivery_pct) * 0.24 +
      vendor.defect_rate_pct * 4.2 +
      vendor.return_rate_pct * 2.2 +
      unsoldPct * 38
  );

  let recommendation = "Monitor";
  if (vendor.contract_risk_score >= 65 || vendor.on_time_delivery_pct < 80) {
    recommendation = "Renegotiate or replace";
  } else if (unsoldPct >= 0.35) {
    recommendation = "Reduce order quantity";
  } else if (vendor.on_time_delivery_pct >= 95 && vendor.defect_rate_pct <= 1.5) {
    recommendation = "Preferred vendor";
  }

  return {
    ...vendor,
    grossProfit,
    grossMarginPct,
    unsoldPct,
    sellThroughPct,
    capitalEfficiency,
    riskComposite,
    recommendation
  };
}

function hydrateFilters() {
  fillSelect(elements.regionFilter, ["All", ...unique("region")]);
  fillSelect(elements.categoryFilter, ["All", ...unique("category")]);
  fillSelect(elements.recommendationFilter, ["All", ...Object.keys(colors)]);
}

function unique(key) {
  return [...new Set(state.scored.map((vendor) => vendor[key]))].sort();
}

function fillSelect(select, values) {
  select.innerHTML = values.map((value) => `<option value="${value}">${value}</option>`).join("");
}

function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const urlFilters = {
    region: params.get("region"),
    category: params.get("category"),
    recommendation: params.get("recommendation"),
    risk: Number(params.get("risk") || state.filters.risk)
  };

  ["region", "category", "recommendation"].forEach((key) => {
    if (urlFilters[key] && [...elements[`${key}Filter`].options].some((option) => option.value === urlFilters[key])) {
      state.filters[key] = urlFilters[key];
      elements[`${key}Filter`].value = urlFilters[key];
    }
  });

  if (Number.isFinite(urlFilters.risk)) {
    state.filters.risk = clamp(urlFilters.risk, 10, 100);
    elements.riskFilter.value = state.filters.risk;
  }
}

function bindEvents() {
  elements.regionFilter.addEventListener("change", (event) => {
    state.filters.region = event.target.value;
    render();
  });
  elements.categoryFilter.addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    render();
  });
  elements.recommendationFilter.addEventListener("change", (event) => {
    state.filters.recommendation = event.target.value;
    render();
  });
  elements.riskFilter.addEventListener("input", (event) => {
    state.filters.risk = Number(event.target.value);
    render();
  });
  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim().toLowerCase();
    render();
  });
  elements.downloadCsv.addEventListener("click", downloadScoredCsv);
}

function filteredVendors() {
  return state.scored.filter((vendor) => {
    const matchesRegion = state.filters.region === "All" || vendor.region === state.filters.region;
    const matchesCategory = state.filters.category === "All" || vendor.category === state.filters.category;
    const matchesRecommendation =
      state.filters.recommendation === "All" || vendor.recommendation === state.filters.recommendation;
    const matchesRisk = vendor.riskComposite <= state.filters.risk;
    const matchesSearch = !state.filters.search || vendor.vendor_name.toLowerCase().includes(state.filters.search);
    return matchesRegion && matchesCategory && matchesRecommendation && matchesRisk && matchesSearch;
  });
}

function render() {
  const vendors = filteredVendors();
  renderKpis(vendors);
  renderInsights(vendors);
  renderCategoryBars(vendors);
  renderQuadrant(vendors);
  renderDonut(vendors);
  renderTable(vendors);
}

function renderKpis(vendors) {
  const revenue = sum(vendors, "revenue");
  const grossProfit = sum(vendors, "grossProfit");
  const stock = sum(vendors, "stock_value");
  const unsold = sum(vendors, "unsold_stock_value");
  const delivery = average(vendors, "on_time_delivery_pct");

  elements.totalRevenue.textContent = currency.format(revenue);
  elements.revenueNote.textContent = `${vendors.length} selected vendors`;
  elements.grossMargin.textContent = revenue ? percent.format(grossProfit / revenue) : "0%";
  elements.unsoldCapital.textContent = currency.format(unsold);
  elements.unsoldNote.textContent = stock ? `${percent.format(unsold / stock)} of selected stock` : "No stock selected";
  elements.deliveryHealth.textContent = `${delivery.toFixed(1)}%`;
  elements.vendorCount.textContent = `${vendors.length} vendors`;
}

function renderInsights(vendors) {
  const sortedRisk = [...vendors].sort((a, b) => b.riskComposite - a.riskComposite);
  const preferred = vendors
    .filter((vendor) => vendor.recommendation === "Preferred vendor")
    .sort((a, b) => b.grossMarginPct - a.grossMarginPct);
  const reorder = [...vendors].sort((a, b) => b.unsold_stock_value - a.unsold_stock_value);

  elements.negotiationTarget.textContent = sortedRisk[0]?.vendor_name || "-";
  elements.preferredTarget.textContent = preferred[0]?.vendor_name || "No preferred match";
  elements.capitalRelease.textContent = reorder[0]
    ? `${reorder[0].vendor_name}: ${currency.format(reorder[0].unsold_stock_value)}`
    : "-";
}

function renderCategoryBars(vendors) {
  const groups = groupBy(vendors, "category").map(([category, rows]) => ({
    category,
    revenue: sum(rows, "revenue"),
    unsold: sum(rows, "unsold_stock_value")
  }));
  const maxRevenue = Math.max(...groups.map((group) => group.revenue), 1);

  elements.categoryBars.innerHTML = groups
    .sort((a, b) => b.revenue - a.revenue)
    .map((group) => {
      const revenueWidth = Math.max(4, (group.revenue / maxRevenue) * 100);
      const unsoldWidth = Math.max(3, (group.unsold / group.revenue) * revenueWidth * 3);
      return `
        <div class="bar-row">
          <div class="bar-label">${group.category}</div>
          <div class="bar-track" title="Revenue ${currency.format(group.revenue)}">
            <span class="bar-fill" style="width:${revenueWidth}%"></span>
            <span class="bar-unsold" style="width:${Math.min(unsoldWidth, revenueWidth)}%"></span>
          </div>
          <div class="bar-value">${currency.format(group.revenue)}</div>
        </div>
      `;
    })
    .join("");
}

function renderQuadrant(vendors) {
  const points = vendors
    .map((vendor) => {
      const x = clamp(vendor.unsoldPct * 180, 7, 93);
      const y = clamp(100 - vendor.grossMarginPct * 170, 7, 93);
      const tone = vendor.recommendation === "Preferred vendor" ? "good" : vendor.riskComposite >= 55 ? "high" : "";
      return `<span class="point ${tone}" style="left:${x}%;top:${y}%" title="${vendor.vendor_name}: ${percent.format(vendor.grossMarginPct)} margin, ${percent.format(vendor.unsoldPct)} unsold"></span>`;
    })
    .join("");

  elements.quadrant.innerHTML = `
    <span class="axis-label" style="left:12px;top:10px">Higher margin</span>
    <span class="axis-label" style="right:12px;bottom:10px">More unsold capital</span>
    ${points}
  `;
}

function renderDonut(vendors) {
  const groups = Object.keys(colors).map((label) => ({
    label,
    count: vendors.filter((vendor) => vendor.recommendation === label).length
  }));
  const total = Math.max(vendors.length, 1);
  let cursor = 0;
  const stops = groups.map((group) => {
    const start = cursor;
    cursor += (group.count / total) * 360;
    return `${colors[group.label]} ${start}deg ${cursor}deg`;
  });

  elements.recommendationDonut.innerHTML = `
    <div class="donut" data-total="${vendors.length}" style="background: conic-gradient(${stops.join(",")})"></div>
    <div class="legend">
      ${groups
        .map(
          (group) => `
          <div class="legend-row">
            <span><i class="swatch" style="background:${colors[group.label]}"></i>${group.label}</span>
            <strong>${group.count}</strong>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}

function renderTable(vendors) {
  elements.vendorTable.innerHTML = [...vendors]
    .sort((a, b) => b.riskComposite - a.riskComposite)
    .map((vendor) => {
      const badgeClass =
        vendor.recommendation === "Renegotiate or replace"
          ? "danger"
          : vendor.recommendation === "Preferred vendor"
            ? "good"
            : "";
      return `
        <tr>
          <td>${vendor.vendor_name}</td>
          <td>${vendor.category}</td>
          <td>${vendor.region}</td>
          <td>${currency.format(vendor.revenue)}</td>
          <td>${percent.format(vendor.grossMarginPct)}</td>
          <td>${percent.format(vendor.unsoldPct)}</td>
          <td>${vendor.on_time_delivery_pct.toFixed(1)}%</td>
          <td>${vendor.riskComposite}</td>
          <td><span class="badge ${badgeClass}">${vendor.recommendation}</span></td>
        </tr>
      `;
    })
    .join("");
}

function downloadScoredCsv() {
  const rows = filteredVendors();
  const fields = [
    "vendor_id",
    "vendor_name",
    "category",
    "region",
    "revenue",
    "grossMarginPct",
    "unsoldPct",
    "riskComposite",
    "recommendation"
  ];
  const csv = [
    fields.join(","),
    ...rows.map((row) => fields.map((field) => JSON.stringify(row[field] ?? "")).join(","))
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "scored_vendor_recommendations.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function groupBy(rows, key) {
  const map = new Map();
  rows.forEach((row) => {
    const group = row[key];
    map.set(group, [...(map.get(group) || []), row]);
  });
  return [...map.entries()];
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + row[key], 0);
}

function average(rows, key) {
  return rows.length ? sum(rows, key) / rows.length : 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
