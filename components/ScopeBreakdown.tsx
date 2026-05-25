"use client";

import React from "react";
import { ChevronDown, Leaf, Factory, ShieldAlert } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { GhgEmission } from "../lib/api";

// Helper to categorize sources into scopes
function getSourceScope(source: string): 1 | 2 | 3 {
  const s = source.toLowerCase();
  if (s.includes("gasoline") || s.includes("diesel") || s.includes("lpg") || s.includes("natural_gas")) {
    return 1;
  }
  if (s.includes("electricity") || s.includes("steam") || s.includes("heat")) {
    return 2;
  }
  return 3; // supply chain, waste, travel, logistics
}

export default function ScopeBreakdown() {
  const { companies, selectedCompanyId, activeYearFilter } = useDashboard();
  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  // 1. Calculate Scope values dynamically
  let scope1Sum = 0;
  let scope2Sum = 0;
  let scope3Sum = 0;

  if (selectedCompany) {
    selectedCompany.emissions.forEach((em: GhgEmission) => {
      const [year] = em.yearMonth.split("-");
      if (year === activeYearFilter) {
        const scope = getSourceScope(em.source);
        if (scope === 1) scope1Sum += em.emissions;
        else if (scope === 2) scope2Sum += em.emissions;
        else if (scope === 3) scope3Sum += em.emissions;
      }
    });
  }

  const scopeRows = [
    {
      name: "Scope 1",
      value: `${scope1Sum.toLocaleString()} tCO₂e`,
      detail: "직접 배출 (Direct operations - e.g., gasoline, lpg, diesel)",
      tone: "solid"
    },
    {
      name: "Scope 2",
      value: `${scope2Sum.toLocaleString()} tCO₂e`,
      detail: "간접 배출 (Purchased energy - e.g., electricity)",
      tone: "mint"
    },
    {
      name: "Scope 3",
      value: `${scope3Sum.toLocaleString()} tCO₂e`,
      detail: "기타 간접 배출 (Supply chain - e.g., logistics, office supply)",
      tone: "sage"
    }
  ];

  // 2. Generate dynamic facilities based on company country/region
  const getMockFacilities = () => {
    if (!selectedCompany) return [];
    
    const countryCode = selectedCompany.country;
    let city1 = "Austin, TX";
    let city2 = "Columbus, OH";
    let city3 = "New York, NY";
    
    if (countryCode === "DE") {
      city1 = "Munich, BY";
      city2 = "Hamburg, HH";
      city3 = "Berlin, BE";
    } else if (countryCode === "KR") {
      city1 = "Seoul HQ";
      city2 = "Busan Plant";
      city3 = "Daejeon Lab";
    } else if (countryCode === "JP") {
      city1 = "Tokyo Lab";
      city2 = "Osaka Center";
      city3 = "Yokohama HQ";
    }

    return [
      {
        site: "주요 제조 공장 (Manufacturing Plant)",
        location: city1,
        emissions: `${Math.round(scope1Sum * 0.95).toLocaleString()} tCO₂e`,
        status: scope1Sum > 100 ? "High" : "Moderate"
      },
      {
        site: "물류 및 유통 센터 (Distribution Center)",
        location: city2,
        emissions: `${Math.round(scope2Sum * 0.95).toLocaleString()} tCO₂e`,
        status: scope2Sum > 100 ? "High" : scope2Sum > 50 ? "Moderate" : "Low"
      },
      {
        site: "본사 사무실 (Corporate Offices)",
        location: city3,
        emissions: `${Math.round(scope3Sum * 0.95).toLocaleString()} tCO₂e`,
        status: "Low"
      }
    ];
  };

  const facilitiesList = getMockFacilities();

  return (
    <section className="lower-grid">
      {/* Scope Panel */}
      <article className="scope-panel">
        <div className="panel-header compact">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Leaf size={18} style={{ color: "var(--teal)" }} />
            스코프별 배출량 (Emissions by Scope)
          </h3>
          <button className="select-button" style={{ fontSize: "13px", height: "32px", minHeight: "32px" }}>
            tCO₂e
            <ChevronDown size={14} />
          </button>
        </div>
        <div className="scope-list">
          {scopeRows.map((scope) => (
            <div className={`scope-card ${scope.tone}`} key={scope.name} style={{ transition: "transform 0.2s ease" }}>
              <div>
                <span>{scope.name}</span>
                <p>{scope.detail}</p>
              </div>
              <strong style={{ fontSize: "20px" }}>{scope.value}</strong>
            </div>
          ))}
        </div>
      </article>

      {/* Facilities Panel */}
      <article className="facility-panel">
        <div className="panel-header compact">
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Factory size={18} style={{ color: "var(--teal)" }} />
            주요 사업장 배출 현황 (Top Facilities)
          </h3>
          <button className="select-button" style={{ fontSize: "13px", height: "32px", minHeight: "32px" }}>
            올해 기준
            <ChevronDown size={14} />
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>사업장명 (Facility)</th>
                <th>위치 (Location)</th>
                <th>배출량 (tCO₂e)</th>
                <th>상태 (Status)</th>
              </tr>
            </thead>
            <tbody>
              {facilitiesList.map((facility, idx) => (
                <tr key={idx} style={{ transition: "background 0.2s ease" }}>
                  <td style={{ fontWeight: 600 }}>{facility.site}</td>
                  <td style={{ color: "var(--muted)" }}>{facility.location}</td>
                  <td style={{ fontWeight: 700, color: "var(--ink)" }}>{facility.emissions}</td>
                  <td>
                    <span className={`status ${facility.status.toLowerCase()}`}>
                      {facility.status === "High" ? "높음 (High)" : facility.status === "Moderate" ? "보통 (Mod)" : "낮음 (Low)"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
