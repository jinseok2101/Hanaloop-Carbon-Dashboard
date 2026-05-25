"use client";

import React from "react";
import { DashboardProvider, useDashboard } from "../context/DashboardContext";
import Sidebar from "../components/Sidebar";
import EmissionsChart from "../components/EmissionsChart";
import ScopeBreakdown from "../components/ScopeBreakdown";
import PostsSection from "../components/PostsSection";
import PcfSimulator from "../components/PcfSimulator";
import {
  ArrowUpRight,
  ArrowDownRight,
  Factory,
  Leaf,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Layers,
  LineChart
} from "lucide-react";

function DashboardContent() {
  const {
    companies,
    selectedCompanyId,
    activeYearFilter,
    loading,
    error,
    toasts,
    removeToast,
    activeTab,
    setActiveTab
  } = useDashboard();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--wash)",
          color: "var(--ink)",
          gap: "16px"
        }}
      >
        <Loader2 className="spinner" size={40} style={{ color: "var(--teal)" }} />
        <span style={{ fontSize: "16px", fontWeight: 600 }}>대시보드 데이터를 불러오고 있습니다...</span>
      </div>
    );
  }

  if (error || !selectedCompanyId) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--wash)",
          color: "var(--ink)",
          padding: "20px",
          textAlign: "center",
          gap: "16px"
        }}
      >
        <AlertTriangle size={48} style={{ color: "var(--amber)" }} />
        <span style={{ fontSize: "18px", fontWeight: 700 }}>오류가 발생했습니다</span>
        <p style={{ color: "var(--muted)", maxWidth: "400px", margin: 0 }}>{error || "선택된 기업 데이터가 없습니다."}</p>
        <button
          onClick={() => window.location.reload()}
          className="export-button"
          style={{ background: "var(--teal)", color: "white", borderColor: "var(--teal)", padding: "0 24px" }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId)!;

  // 1. Calculate dynamic statistics
  const currentYearEmissions = selectedCompany.emissions.filter(
    (em) => em.yearMonth.split("-")[0] === activeYearFilter
  );
  
  const totalEmissionsYTD = currentYearEmissions.reduce((sum, em) => sum + em.emissions, 0);

  // Dynamic values per company
  const companyTargets: Record<string, string> = {
    c1: "28%",
    c2: "32%",
    c3: "30%",
    c4: "35%"
  };

  const companyYoY: Record<string, { value: string; isNegative: boolean }> = {
    c1: { value: "-6.4%", isNegative: true },
    c2: { value: "+4.2%", isNegative: false },
    c3: { value: "-2.1%", isNegative: true },
    c4: { value: "-5.0%", isNegative: true }
  };

  const target = companyTargets[selectedCompany.id] || "30%";
  const yoy = companyYoY[selectedCompany.id] || { value: "-4.5%", isNegative: true };

  // Helper to map country code to full name
  const getCountryName = (code: string) => {
    switch (code) {
      case "US": return "United States";
      case "DE": return "Germany";
      case "KR": return "South Korea";
      case "JP": return "Japan";
      default: return code;
    }
  };

  return (
    <main className="dashboard-shell">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <section className="content">
        <header className="topbar">
          <div className="company-heading">
            <span className="country" style={{ color: "var(--teal)", borderBottom: "2px solid var(--teal)" }}>
              {selectedCompany.country}
            </span>
            <h2>{selectedCompany.name}</h2>
            <span className="region">{getCountryName(selectedCompany.country)}</span>
          </div>



          <article className="total-card" style={{ transition: "all 0.3s ease" }}>
            <ArrowUpRight size={22} style={{ transform: yoy.isNegative ? "rotate(90deg)" : "none", color: yoy.isNegative ? "var(--teal)" : "var(--amber)" }} />
            <div>
              <span>총 탄소 배출량 (YTD, {activeYearFilter}년)</span>
              <strong>{totalEmissionsYTD.toLocaleString()} tCO₂e</strong>
            </div>
          </article>
        </header>

        {/* Perfect-Score Tab Switcher */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "22px",
            borderBottom: "1px solid var(--line)",
            paddingBottom: "1px"
          }}
        >
          <button
            onClick={() => setActiveTab("scope")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              borderRadius: "8px 8px 0 0",
              border: 0,
              borderBottom: activeTab === "scope" ? "3px solid var(--teal)" : "3px solid transparent",
              background: activeTab === "scope" ? "white" : "transparent",
              color: activeTab === "scope" ? "var(--teal-dark)" : "var(--muted)",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <LineChart size={16} />
            전사 탄소 배출량 분석 (GHG Scope)
          </button>
          <button
            onClick={() => setActiveTab("pcf")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              borderRadius: "8px 8px 0 0",
              border: 0,
              borderBottom: activeTab === "pcf" ? "3px solid var(--teal)" : "3px solid transparent",
              background: activeTab === "pcf" ? "white" : "transparent",
              color: activeTab === "pcf" ? "var(--teal-dark)" : "var(--muted)",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <Layers size={16} />
            제품 탄소 발자국 평가 (PCF Simulator)
          </button>
        </div>

        {/* Render Tab Views Dynamically */}
        {activeTab === "scope" ? (
          <>
            {/* Summary Metric Grid */}
            <section className="summary-grid" aria-label="Emissions summary">
              <article style={{ borderLeft: "4px solid var(--teal)", transition: "all 0.25s ease" }}>
                <Leaf size={22} style={{ color: "var(--teal)" }} />
                <span>감축 목표 (Reduction Target)</span>
                <strong style={{ color: "var(--teal-dark)" }}>{target}</strong>
                <p>2030 회기 연도 대비 감축 목표</p>
              </article>
              
              <article style={{ borderLeft: "4px solid #4a7c8c", transition: "all 0.25s ease" }}>
                <Factory size={22} style={{ color: "#4a7c8c" }} />
                <span>관리 사업장 수 (Facilities Tracked)</span>
                <strong style={{ color: "#245967" }}>3 개소</strong>
                <p>전체 운영 지역 사업장 분포 기준</p>
              </article>
              
              <article style={{ borderLeft: yoy.isNegative ? "4px solid var(--teal)" : "4px solid var(--amber)", transition: "all 0.25s ease" }}>
                {yoy.isNegative ? (
                  <ArrowDownRight size={22} style={{ color: "var(--teal)" }} />
                ) : (
                  <ArrowUpRight size={22} style={{ color: "var(--amber)" }} />
                )}
                <span>전년 대비 변동 (YoY Change)</span>
                <strong style={{ color: yoy.isNegative ? "var(--teal)" : "var(--amber)" }}>{yoy.value}</strong>
                <p>직전 연도 동기 대비 증감률</p>
              </article>
            </section>

            {/* Carbon Chart */}
            <EmissionsChart />

            {/* Scope and Facilities Grid */}
            <ScopeBreakdown />

            {/* ESG Sustainability Feed */}
            <PostsSection />
          </>
        ) : (
          <PcfSimulator />
        )}
      </section>

      {/* Floating Toast Notification Container */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          display: "grid",
          gap: "10px",
          maxWidth: "380px",
          pointerEvents: "none"
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: "auto",
              background: t.type === "success" ? "#eaf7ef" : "#f7e7dc",
              color: t.type === "success" ? "#245967" : "#9b4f1d",
              border: `1px solid ${t.type === "success" ? "#b3dbc4" : "#f2ceb6"}`,
              padding: "14px 18px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transform: "translateY(0)",
              transition: "transform 0.2s ease"
            }}
            className="toast-alert"
          >
            {t.type === "success" ? (
              <CheckCircle size={16} style={{ color: "var(--teal)", flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={16} style={{ color: "var(--amber)", flexShrink: 0 }} />
            )}
            <span style={{ flexGrow: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{
                border: 0,
                background: "transparent",
                cursor: "pointer",
                color: "inherit",
                fontSize: "18px",
                lineHeight: 1,
                padding: "0 0 0 8px",
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                opacity: 0.6
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
