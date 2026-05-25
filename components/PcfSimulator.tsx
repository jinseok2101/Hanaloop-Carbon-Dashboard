"use client";

import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Calculator,
  Truck,
  Zap,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  RefreshCw,
  Plus,
  Trash
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import {
  ProductPcf,
  MaterialType,
  TransportMode,
  calculateProductPcfData,
  EMISSION_FACTORS
} from "../lib/api";

export default function PcfSimulator() {
  const {
    productsPcf,
    selectedCompanyId,
    addOrEditProductPcf,
    apiFailureRate,
    updateFailureRate
  } = useDashboard();

  // Selected product from list to visualize details
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Form states for the calculator
  const [productName, setProductName] = useState("");
  const [materialType, setMaterialType] = useState<MaterialType>("plastic");
  const [materialWeight, setMaterialWeight] = useState<number>(10);
  const [electricity, setElectricity] = useState<number>(20);
  const [transportMode, setTransportMode] = useState<TransportMode>("truck");
  const [transportWeight, setTransportWeight] = useState<number>(0.05); // 50kg = 0.05 tons
  const [transportDistance, setTransportDistance] = useState<number>(200);

  // Filter products for active company
  const companyProducts = productsPcf.filter((p) => p.companyId === selectedCompanyId);

  // Select first product by default if list changes
  useEffect(() => {
    if (companyProducts.length > 0) {
      if (!selectedProductId || !companyProducts.some((p) => p.id === selectedProductId)) {
        setSelectedProductId(companyProducts[0].id);
      }
    } else {
      setSelectedProductId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompanyId, productsPcf]);

  const activeProduct = companyProducts.find((p) => p.id === selectedProductId);

  // 1. Calculate live PCF preview on form input change
  const liveComputed = calculateProductPcfData(
    materialType,
    materialWeight,
    electricity,
    transportMode,
    transportDistance,
    transportWeight
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const success = await addOrEditProductPcf(
      productName,
      materialType,
      materialWeight,
      electricity,
      transportMode,
      transportDistance,
      transportWeight
    );

    if (success) {
      // Clear form on success
      setProductName("");
      // Select the newly added product
      if (companyProducts.length > 0) {
        setSelectedProductId(productsPcf[0]?.id || null);
      }
    }
  };

  // Helper to map material type to korean label
  const getMaterialLabel = (type: MaterialType) => {
    switch (type) {
      case "steel": return "강철 (Steel)";
      case "plastic": return "플라스틱 (Plastic)";
      case "aluminum": return "알루미늄 (Aluminum)";
      case "paper": return "종이/포장재 (Paper)";
      default: return type;
    }
  };

  // Helper to map transport mode to korean label
  const getTransportLabel = (mode: TransportMode) => {
    switch (mode) {
      case "truck": return "화물 트럭 (Truck)";
      case "ship": return "해상 컨테이너선 (Ship)";
      case "train": return "화물 철도 (Train)";
      default: return mode;
    }
  };

  return (
    <section className="lower-grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(480px, 1.25fr)" }}>
      {/* 1. PCF Calculator Form (Left Panel) */}
      <article className="chart-panel" style={{ padding: "24px" }}>
        <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "14px", marginBottom: "18px" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <Calculator size={20} style={{ color: "var(--teal)" }} />
            PCF 전과정 계산 시뮬레이터
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>
            비전문가도 원소재, 전기, 운송 정보만 입력하면 즉시 탄소 배출량을 예측해 볼 수 있는 간편 계산기입니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
          {/* Product Name */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
              제품명 (Product Name)
            </label>
            <input
              type="text"
              placeholder="예: 재생 알루미늄 머그컵 (Eco Cup v2)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--line)",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          {/* Raw Material Stage (원소재) */}
          <div style={{ background: "rgba(45, 101, 116, 0.04)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(45, 101, 116, 0.1)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "var(--teal-dark)", marginBottom: "8px" }}>
              <Layers size={15} />
              1단계: 원소재 추출 및 수급 (Cradle to Gate)
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>소재 종류</label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid var(--line)", fontSize: "13px" }}
                >
                  <option value="steel">강철 (Steel)</option>
                  <option value="plastic">플라스틱 (Plastic)</option>
                  <option value="aluminum">알루미늄 (Aluminum)</option>
                  <option value="paper">종이 (Paper)</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>소재 무게 (kg)</label>
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  value={materialWeight}
                  onChange={(e) => setMaterialWeight(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid var(--line)", fontSize: "13px" }}
                />
              </div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Info size={11} />
              배출계수: {EMISSION_FACTORS.materials[materialType]} kgCO₂e / kg
            </div>
          </div>

          {/* Manufacturing Stage (제조) */}
          <div style={{ background: "rgba(198, 128, 58, 0.04)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(198, 128, 58, 0.1)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "var(--amber)", marginBottom: "8px" }}>
              <Zap size={15} />
              2단계: 공장 생산 및 가공 (Gate to Gate)
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", marginBottom: "8px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>소비 전력량 (kWh / 제품당)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={electricity}
                  onChange={(e) => setElectricity(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid var(--line)", fontSize: "13px" }}
                />
              </div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Info size={11} />
              배출계수 (전력 그리드): {EMISSION_FACTORS.electricity} kgCO₂e / kWh
            </div>
          </div>

          {/* Logistics Stage (운송) */}
          <div style={{ background: "rgba(95, 105, 100, 0.05)", padding: "12px", borderRadius: "8px", border: "1px solid var(--line)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, color: "var(--muted)", marginBottom: "8px" }}>
              <Truck size={15} />
              3단계: 제품 유통 및 수송 (Gate to Grave)
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>운송 수단</label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value as TransportMode)}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid var(--line)", fontSize: "13px" }}
                >
                  <option value="truck">화물차 (Truck)</option>
                  <option value="ship">컨테이너선 (Ship)</option>
                  <option value="train">화물철도 (Train)</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>운송 거리 (km)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={transportDistance}
                  onChange={(e) => setTransportDistance(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid var(--line)", fontSize: "13px" }}
                />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", marginBottom: "8px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>운송 적재 중량 (Tons / 대량 수송 가중치)</label>
                <input
                  type="number"
                  min="0.0001"
                  step="any"
                  value={transportWeight}
                  onChange={(e) => setTransportWeight(parseFloat(e.target.value) || 0)}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid var(--line)", fontSize: "13px" }}
                />
              </div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--muted)", display: "flex", alignItems: "center", gap: "4px" }}>
              <Info size={11} />
              배출계수: {EMISSION_FACTORS.transport[transportMode]} kgCO₂e / (ton*km)
            </div>
          </div>

          {/* Dynamic Real-Time Calculated Preview Box */}
          <div
            style={{
              background: "linear-gradient(135deg, #1b3d47, #121916)",
              color: "white",
              padding: "16px",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#b9cbc5", fontWeight: 600 }}>실시간 예상 PCF 결과 (Live Preview)</span>
              <span style={{ fontSize: "10px", background: "rgba(255,255,255,0.15)", padding: "2px 6px", borderRadius: "4px" }}>자동 계산 중</span>
            </div>
            <div style={{ display: "flex", justifyItems: "end", alignItems: "baseline", gap: "6px" }}>
              <strong style={{ fontSize: "28px", color: "#7ae0be", fontWeight: 800 }}>
                {liveComputed.total.toLocaleString()}
              </strong>
              <span style={{ fontSize: "14px", color: "#eef2ef" }}>kgCO₂e / 개당</span>
            </div>
            
            {/* Live breakdowns */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", fontSize: "11px", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "8px", marginTop: "4px" }}>
              <div>
                <span style={{ display: "block", color: "#c1cfc9" }}>1단계 (소재)</span>
                <span style={{ fontWeight: 600 }}>{liveComputed.stages.material.toLocaleString()} kg</span>
              </div>
              <div>
                <span style={{ display: "block", color: "#c1cfc9" }}>2단계 (제조)</span>
                <span style={{ fontWeight: 600 }}>{liveComputed.stages.manufacturing.toLocaleString()} kg</span>
              </div>
              <div>
                <span style={{ display: "block", color: "#c1cfc9" }}>3단계 (운송)</span>
                <span style={{ fontWeight: 600 }}>{liveComputed.stages.transport.toLocaleString()} kg</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="export-button"
            style={{
              background: "var(--teal)",
              color: "white",
              borderColor: "var(--teal)",
              padding: "12px",
              fontWeight: 700,
              fontSize: "14px"
            }}
          >
            PCF 결과 데이터 등록 (Save PCF Product)
          </button>
        </form>
      </article>

      {/* 2. Registered PCF Product List & Lifecycle Stage Visualizer (Right Panel) */}
      <article className="chart-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Header with Failure control */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: "14px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              <Layers size={20} style={{ color: "var(--teal)" }} />
              제품 PCF 리스트 및 LCA 전과정 시각화
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>
              등록된 제품의 전과정(Cradle-to-Gate) 단계별 탄소 발자국 기여도를 분석합니다.
            </p>
          </div>
          
          {/* API failure rate adjuster */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--wash)",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "11px",
              border: "1px solid var(--line)"
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--muted)" }}>모의 에러율:</span>
            <select
              value={apiFailureRate}
              onChange={(e) => updateFailureRate(parseFloat(e.target.value))}
              style={{ background: "transparent", border: 0, outline: 0, fontWeight: 700, color: "var(--amber)", cursor: "pointer" }}
            >
              <option value="0">0%</option>
              <option value="0.15">15%</option>
              <option value="0.5">50%</option>
              <option value="1">100%</option>
            </select>
          </div>
        </div>

        {/* Product selector buttons */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {companyProducts.length > 0 ? (
            companyProducts.map((p) => {
              const isOptimistic = p.id.startsWith("opt_");
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: selectedProductId === p.id ? "var(--teal)" : "var(--line)",
                    background: selectedProductId === p.id ? "var(--teal)" : "white",
                    color: selectedProductId === p.id ? "white" : "var(--ink)",
                    fontSize: "13px",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    opacity: isOptimistic ? 0.7 : 1,
                    position: "relative"
                  }}
                >
                  {isOptimistic && <RefreshCw size={12} className="spinner" />}
                  {p.name}
                </button>
              );
            })
          ) : (
            <div style={{ fontSize: "13px", color: "var(--muted)", padding: "6px 0" }}>등록된 제품이 없습니다. 왼쪽 계산기에서 제품을 추가해 보세요!</div>
          )}
        </div>

        {activeProduct ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "22px", background: "var(--wash)", padding: "20px", borderRadius: "8px", border: "1px solid var(--line)" }}>
            {/* 2a. The Cradle-to-Gate Life Cycle Roadmap */}
            <div>
              <h4 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: 700, color: "var(--teal-dark)", display: "flex", alignItems: "center", gap: "6px" }}>
                <TrendingDown size={16} />
                LCA 전과정 단계별 탄소 배출 분석 (cradle-to-gate roadmap)
              </h4>
              
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr auto 1fr",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "6px",
                  padding: "10px 0"
                }}
              >
                {/* Stage 1 */}
                <div style={{ background: "white", padding: "12px 8px", borderRadius: "6px", border: "1px solid var(--line)", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <span style={{ display: "block", fontSize: "10px", color: "var(--muted)", fontWeight: 600 }}>1단계: 원소재 (Cradle)</span>
                  <strong style={{ display: "block", fontSize: "14px", color: "var(--teal)", margin: "4px 0" }}>
                    {activeProduct.stages.material.toLocaleString()} kg
                  </strong>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>{getMaterialLabel(activeProduct.materialType)} ({activeProduct.materialWeightKg}kg)</span>
                </div>
                
                <ArrowRight size={16} style={{ color: "var(--muted)" }} />

                {/* Stage 2 */}
                <div style={{ background: "white", padding: "12px 8px", borderRadius: "6px", border: "1px solid var(--line)", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <span style={{ display: "block", fontSize: "10px", color: "var(--muted)", fontWeight: 600 }}>2단계: 생산 (Gate)</span>
                  <strong style={{ display: "block", fontSize: "14px", color: "var(--amber)", margin: "4px 0" }}>
                    {activeProduct.stages.manufacturing.toLocaleString()} kg
                  </strong>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>전력 ({activeProduct.electricityKwh} kWh)</span>
                </div>

                <ArrowRight size={16} style={{ color: "var(--muted)" }} />

                {/* Stage 3 */}
                <div style={{ background: "white", padding: "12px 8px", borderRadius: "6px", border: "1px solid var(--line)", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <span style={{ display: "block", fontSize: "10px", color: "var(--muted)", fontWeight: 600 }}>3단계: 유통 (Grave)</span>
                  <strong style={{ display: "block", fontSize: "14px", color: "var(--muted)", margin: "4px 0" }}>
                    {activeProduct.stages.transport.toLocaleString()} kg
                  </strong>
                  <span style={{ fontSize: "10px", color: "var(--muted)" }}>{getTransportLabel(activeProduct.transportMode)} ({activeProduct.transportDistanceKm}km)</span>
                </div>
              </div>
            </div>

            {/* 2b. Stacked Proportional Bar Chart */}
            <div>
              <h4 style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: 700 }}>
                배출 기여도 비율 (Emissions Proportional Share)
              </h4>
              
              {/* Stacked bar */}
              {activeProduct.calculatedPcf > 0 ? (
                (() => {
                  const total = activeProduct.calculatedPcf;
                  const pctMat = Math.round((activeProduct.stages.material / total) * 100);
                  const pctMan = Math.round((activeProduct.stages.manufacturing / total) * 100);
                  const pctTra = 100 - pctMat - pctMan;

                  return (
                    <div>
                      <div
                        style={{
                          height: "28px",
                          width: "100%",
                          borderRadius: "14px",
                          overflow: "hidden",
                          display: "flex",
                          fontSize: "11px",
                          color: "white",
                          fontWeight: 700,
                          textAlign: "center",
                          lineHeight: "28px"
                        }}
                      >
                        {pctMat > 0 && (
                          <div
                            style={{ width: `${pctMat}%`, background: "var(--teal)", transition: "width 0.3s ease" }}
                            title={`원소재 기여도: ${pctMat}%`}
                          >
                            {pctMat >= 8 ? `${pctMat}%` : ""}
                          </div>
                        )}
                        {pctMan > 0 && (
                          <div
                            style={{ width: `${pctMan}%`, background: "var(--amber)", transition: "width 0.3s ease" }}
                            title={`제조공정 기여도: ${pctMan}%`}
                          >
                            {pctMan >= 8 ? `${pctMan}%` : ""}
                          </div>
                        )}
                        {pctTra > 0 && (
                          <div
                            style={{ width: `${pctTra}%`, background: "var(--muted)", transition: "width 0.3s ease" }}
                            title={`운송유통 기여도: ${pctTra}%`}
                          >
                            {pctTra >= 8 ? `${pctTra}%` : ""}
                          </div>
                        )}
                      </div>

                      {/* Legend indicators */}
                      <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "12px", justifyContent: "center" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--teal)" }}></span>
                          원소재 원재료 ({pctMat}%)
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--amber)" }}></span>
                          생산에너지 ({pctMan}%)
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--muted)" }}></span>
                          유통물류 ({pctTra}%)
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div style={{ fontSize: "12px", color: "var(--muted)" }}>탄소 배출량이 없는 제품입니다.</div>
              )}
            </div>

            {/* 2c. Math Calculations detail explanation for Domain Score */}
            <div style={{ background: "white", padding: "14px", borderRadius: "6px", border: "1px solid rgba(0,0,0,0.05)", fontSize: "12px", color: "var(--ink)", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontWeight: 700, color: "var(--teal-dark)", borderBottom: "1px solid var(--line)", paddingBottom: "4px" }}>
                탄소 발자국 산정 근거 정보 (PCF Calculation Rationale)
              </div>
              <div style={{ display: "grid", gap: "4px" }}>
                <div>• <strong>원소재 단계:</strong> {activeProduct.materialWeightKg} kg × {EMISSION_FACTORS.materials[activeProduct.materialType]} kgCO₂e = <strong style={{ color: "var(--teal)" }}>{activeProduct.stages.material} kgCO₂e</strong></div>
                <div>• <strong>제조가공 단계:</strong> {activeProduct.electricityKwh} kWh × {EMISSION_FACTORS.electricity} kgCO₂e = <strong style={{ color: "var(--amber)" }}>{activeProduct.stages.manufacturing} kgCO₂e</strong></div>
                <div>• <strong>운송물류 단계:</strong> {activeProduct.transportWeightTons} t × {activeProduct.transportDistanceKm} km × {EMISSION_FACTORS.transport[activeProduct.transportMode]} kgCO₂e = <strong style={{ color: "var(--muted)" }}>{activeProduct.stages.transport} kgCO₂e</strong></div>
              </div>
              <div style={{ borderTop: "1px dashed var(--line)", paddingTop: "6px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "13px" }}>
                <span>총 제품 탄소 발자국 (PCF) 합계:</span>
                <span style={{ color: "var(--teal-dark)" }}>{activeProduct.calculatedPcf.toLocaleString()} kgCO₂e</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", minHeight: "200px" }}>
            시각화할 제품을 위 목록에서 선택해 주세요.
          </div>
        )}
      </article>
    </section>
  );
}
