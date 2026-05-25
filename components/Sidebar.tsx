"use client";

import React, { useState } from "react";
import { Building2, Search, X } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";

export default function Sidebar() {
  const { companies, selectedCompanyId, selectCompany } = useDashboard();
  const [sidebarSearch, setSidebarSearch] = useState("");

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <Building2 size={22} />
        <h1>Companies</h1>
      </div>
      
      {/* Search Input for Companies List */}
      <div className="sidebar-search" style={{ padding: "0 12px 14px", position: "relative" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          border: "1px solid var(--line)",
          borderRadius: "6px",
          padding: "0 10px",
          height: "36px",
          background: "white"
        }}>
          <Search size={14} style={{ color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="회사 검색..."
            value={sidebarSearch}
            onChange={(e) => setSidebarSearch(e.target.value)}
            style={{
              border: 0,
              outline: 0,
              width: "100%",
              fontSize: "13px",
              background: "transparent"
            }}
          />
          {sidebarSearch && (
            <button
              onClick={() => setSidebarSearch("")}
              style={{ border: 0, background: "transparent", display: "flex", padding: 0 }}
            >
              <X size={14} style={{ color: "var(--muted)" }} />
            </button>
          )}
        </div>
      </div>

      <nav className="company-list" aria-label="Companies">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <button
              className={selectedCompanyId === company.id ? "company active" : "company"}
              key={company.id}
              onClick={() => selectCompany(company.id)}
            >
              {company.name}
            </button>
          ))
        ) : (
          <div style={{ padding: "16px 12px", color: "var(--muted)", fontSize: "14px", textAlign: "center" }}>
            검색 결과가 없습니다.
          </div>
        )}
      </nav>
    </aside>
  );
}
