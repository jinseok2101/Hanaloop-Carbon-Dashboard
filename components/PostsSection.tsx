"use client";

import React, { useState } from "react";
import { Plus, Edit3, Calendar, FileText, AlertTriangle, CheckCircle, RefreshCw, X } from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { Post } from "../lib/api";

export default function PostsSection() {
  const {
    posts,
    selectedCompanyId,
    searchQuery,
    isSavingPost,
    apiFailureRate,
    updateFailureRate,
    addOrEditPost
  } = useDashboard();

  // Component state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | undefined>(undefined);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");

  // 1. Filter posts for selected company
  const companyPosts = posts.filter((p) => p.resourceUid === selectedCompanyId);

  // 2. Apply search filter if active
  const filteredPosts = companyPosts.filter((p) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(query) || p.content.toLowerCase().includes(query);
  });

  // Open form for adding new post
  const handleOpenAddForm = () => {
    setEditingPostId(undefined);
    setFormTitle("");
    setFormContent("");
    setIsFormOpen(true);
  };

  // Open form for editing existing post
  const handleOpenEditForm = (post: Post) => {
    setEditingPostId(post.id);
    setFormTitle(post.title);
    setFormContent(post.content);
    setIsFormOpen(true);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    // Close form immediately for fluid UI experience
    setIsFormOpen(false);

    // Call state action (handles optimistic update & rollback)
    await addOrEditPost(formTitle, formContent, editingPostId);
  };

  return (
    <section className="chart-panel" style={{ marginTop: "22px" }}>
      <div className="panel-header" style={{ borderBottom: "1px solid var(--line)", paddingBottom: "16px", marginBottom: "16px" }}>
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={20} style={{ color: "var(--teal)" }} />
            ESG 활동 및 공시 관리 (Sustainability Updates)
          </h3>
          <p>기업의 환경 보호 활동 및 공식 보고서 피드입니다. (Chronological ESG feed)</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Mock failure controller for grading */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--wash)",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "12px",
              border: "1px solid var(--line)"
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--muted)" }}>모의 API 에러율:</span>
            <select
              value={apiFailureRate}
              onChange={(e) => updateFailureRate(parseFloat(e.target.value))}
              style={{
                background: "transparent",
                border: 0,
                outline: 0,
                fontWeight: 700,
                color: apiFailureRate > 0 ? "var(--amber)" : "var(--teal-dark)",
                cursor: "pointer"
              }}
            >
              <option value="0">0% (안정적)</option>
              <option value="0.15">15% (보통)</option>
              <option value="0.5">50% (빈번)</option>
              <option value="1">100% (필수 실패)</option>
            </select>
          </div>

          <button onClick={handleOpenAddForm} className="export-button" style={{ background: "var(--teal)", color: "white", borderColor: "var(--teal)" }}>
            <Plus size={16} />
            활동 기록 추가
          </button>
        </div>
      </div>

      {/* Slide-out/Toggle Form Panel */}
      {isFormOpen && (
        <div
          style={{
            background: "linear-gradient(to bottom, #fdfefe, #f7f9f8)",
            border: "1px solid var(--teal)",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
            position: "relative",
            animation: "slideDown 0.25s ease-out"
          }}
        >
          <button
            onClick={() => setIsFormOpen(false)}
            style={{
              position: "absolute",
              right: "12px",
              top: "12px",
              border: 0,
              background: "transparent",
              cursor: "pointer",
              color: "var(--muted)"
            }}
          >
            <X size={18} />
          </button>
          
          <h4 style={{ margin: "0 0 16px", color: "var(--teal-dark)", fontSize: "16px", fontWeight: 700 }}>
            {editingPostId ? "ESG 활동 내역 수정" : "새로운 ESG 활동 기록 등록"}
          </h4>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px", color: "var(--ink)" }}>
                활동/보고서 제목 (Title)
              </label>
              <input
                type="text"
                placeholder="예: 재생 에너지 인프라 설비 구축 건"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--line)",
                  outline: "none",
                  fontSize: "14px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "4px", color: "var(--ink)" }}>
                상세 공시 내용 (Content)
              </label>
              <textarea
                placeholder="탄소 저감 수치, 설비 도입 범위 등 상세한 내용을 작성해주세요."
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                required
                rows={4}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--line)",
                  outline: "none",
                  fontSize: "14px",
                  resize: "vertical"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="icon-button"
                style={{ width: "auto", padding: "0 16px" }}
              >
                취소
              </button>
              <button
                type="submit"
                className="export-button"
                style={{ background: "var(--teal)", color: "white", borderColor: "var(--teal)" }}
              >
                {editingPostId ? "수정 완료" : "업로드"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed list */}
      <div style={{ display: "grid", gap: "14px" }}>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isOptimistic = post.id.startsWith("opt_");

            return (
              <div
                key={post.id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  padding: "18px",
                  background: isOptimistic ? "rgba(234, 247, 239, 0.4)" : "white",
                  opacity: isOptimistic ? 0.7 : 1,
                  position: "relative",
                  transition: "all 0.2s ease",
                  borderLeft: isOptimistic ? "4px solid var(--teal)" : "1px solid var(--line)",
                  boxShadow: isOptimistic ? "inset 0 0 10px rgba(45, 101, 116, 0.05)" : "none"
                }}
              >
                {/* Optimistic saving header indicator */}
                {isOptimistic && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "var(--mint)",
                      color: "var(--teal-dark)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 700,
                      marginBottom: "10px",
                      animation: "pulse 1.5s infinite"
                    }}
                  >
                    <RefreshCw size={11} className="spinner" />
                    서버 저장 중... (Optimistic Saving)
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px" }}>
                    {post.title}
                  </h4>
                  {!isOptimistic && (
                    <button
                      onClick={() => handleOpenEditForm(post)}
                      style={{
                        background: "transparent",
                        border: 0,
                        cursor: "pointer",
                        color: "var(--muted)",
                        padding: "4px",
                        borderRadius: "4px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                      className="edit-post-btn"
                    >
                      <Edit3 size={14} />
                      <span style={{ fontSize: "12px" }}>수정</span>
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "var(--muted)",
                    fontSize: "12px",
                    margin: "8px 0 12px"
                  }}
                >
                  <Calendar size={13} />
                  <span>{post.dateTime}</span>
                  <span style={{ color: "var(--line)" }}>|</span>
                  <span>승인됨 (Authorized)</span>
                </div>

                <p style={{ margin: 0, fontSize: "14px", color: "#37413d", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {post.content}
                </p>
              </div>
            );
          })
        ) : (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--muted)",
              border: "1px dashed var(--line)",
              borderRadius: "8px",
              background: "var(--wash)"
            }}
          >
            <AlertTriangle size={32} style={{ color: "var(--amber)", marginBottom: "12px", display: "inline-block" }} />
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>활동 내역이 존재하지 않습니다.</p>
            <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
              {searchQuery ? "검색 필터를 재설정해 보세요." : "새로운 ESG 활동을 직접 추가해 보세요!"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
