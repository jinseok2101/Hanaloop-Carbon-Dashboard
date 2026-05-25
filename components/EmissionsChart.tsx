"use client";

import React, { useState } from "react";
import { ChevronDown, BarChart2 } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { GhgEmission } from "../lib/api";

const MONTHS_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_MAP: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
  "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
};

export default function EmissionsChart() {
  const { companies, selectedCompanyId, activeYearFilter, setActiveYearFilter } = useDashboard();
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  // 1. Process emissions data for the active year
  const monthlyData: Record<string, { total: number; sources: Record<string, number> }> = {};
  
  // Initialize months
  MONTHS_ORDER.forEach((m) => {
    monthlyData[m] = { total: 0, sources: {} };
  });

  if (selectedCompany) {
    selectedCompany.emissions.forEach((em: GhgEmission) => {
      const [year, monthCode] = em.yearMonth.split("-");
      if (year === activeYearFilter) {
        const monthName = MONTH_MAP[monthCode];
        if (monthName) {
          monthlyData[monthName].total += em.emissions;
          monthlyData[monthName].sources[em.source] = (monthlyData[monthName].sources[em.source] || 0) + em.emissions;
        }
      }
    });
  }

  // 2. Find max emissions for scaling the chart
  const monthlyTotals = MONTHS_ORDER.map((m) => monthlyData[m].total);
  const maxEmissionRaw = Math.max(...monthlyTotals, 0);
  const maxEmission = maxEmissionRaw > 0 ? Math.ceil(maxEmissionRaw / 10) * 10 : 100;

  // 3. Y-axis labels (5 ticks)
  const yTicks = [
    maxEmission,
    Math.round(maxEmission * 0.75),
    Math.round(maxEmission * 0.5),
    Math.round(maxEmission * 0.25),
    0
  ];

  const years = ["2024", "2025"];

  return (
    <section className="chart-panel">
      <div className="panel-header">
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BarChart2 size={20} style={{ color: "var(--teal)" }} />
            월별 온실가스 배출량 (Monthly GHG Emissions)
          </h3>
          <p>이산화탄소 상당량 톤 수 (Carbon output measured in tCO₂e)</p>
        </div>
        
        <div style={{ position: "relative", display: "inline-block" }}>
          <select
            value={activeYearFilter}
            onChange={(e) => setActiveYearFilter(e.target.value)}
            className="select-button"
            style={{
              appearance: "none",
              paddingRight: "32px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px"
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y} 년
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              color: "var(--muted)"
            }}
          />
        </div>
      </div>

      <div className="chart-wrap" style={{ position: "relative" }}>
        {/* Y-Axis */}
        <div className="y-axis" aria-hidden="true">
          {yTicks.map((tick, index) => (
            <span key={index}>{tick.toLocaleString()}</span>
          ))}
        </div>

        {/* Chart Area */}
        <div className="chart" style={{ position: "relative" }}>
          {MONTHS_ORDER.map((month) => {
            const data = monthlyData[month];
            const heightPercentage = maxEmission > 0 ? (data.total / maxEmission) * 100 : 0;
            const isHovered = hoveredMonth === month;

            return (
              <div
                className="bar-column"
                key={month}
                onMouseEnter={() => setHoveredMonth(month)}
                onMouseLeave={() => setHoveredMonth(null)}
                style={{ position: "relative", cursor: "pointer" }}
              >
                <div
                  className="bar"
                  style={{
                    height: `${heightPercentage}%`,
                    background: isHovered ? "var(--teal-dark)" : "var(--teal)",
                    transition: "height 0.3s ease, background-color 0.2s ease",
                    boxShadow: isHovered ? "0 0 10px rgba(45, 101, 116, 0.4)" : "none"
                  }}
                />
                <span style={{ fontWeight: isHovered ? 700 : 400 }}>{month}</span>

                {/* Custom Source Breakdown Tooltip */}
                {isHovered && data.total > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: `${heightPercentage + 5}%`,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(18, 25, 22, 0.95)",
                      color: "white",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 6px 16px rgba(0, 0, 0, 0.3)",
                      zIndex: 10,
                      minWidth: "160px",
                      textAlign: "left",
                      pointerEvents: "none",
                      border: "1px solid rgba(255, 255, 255, 0.15)"
                    }}
                  >
                    <div style={{ fontWeight: 700, borderBottom: "1px solid rgba(255, 255, 255, 0.2)", paddingBottom: "4px", marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                      <span>{month} 총 배출량</span>
                      <span style={{ color: "#7ae0be" }}>{data.total.toLocaleString()} t</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {Object.entries(data.sources).map(([source, val]) => (
                        <div key={source} style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                          <span style={{ color: "#c1cfc9" }}>• {source}</span>
                          <span style={{ fontWeight: 600 }}>{val.toLocaleString()} t</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
