"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  Company,
  Post,
  Country,
  ProductPcf,
  MaterialType,
  TransportMode,
  fetchCompanies,
  fetchPosts,
  fetchCountries,
  fetchProductsPcf,
  createOrUpdatePost,
  createOrUpdateProductPcf,
  calculateProductPcfData,
  setApiFailureRate as setMockApiFailureRate,
  getApiFailureRate as getMockApiFailureRate
} from "../lib/api";

interface Toast {
  message: string;
  type: "success" | "error";
  id: number;
}

interface DashboardContextType {
  companies: Company[];
  posts: Post[];
  countries: Country[];
  productsPcf: ProductPcf[];
  loading: boolean;
  error: string | null;
  selectedCompanyId: string | null;
  searchQuery: string;
  activeYearFilter: string;
  isSavingPost: boolean;
  apiFailureRate: number;
  toasts: Toast[];
  activeTab: "scope" | "pcf";
  
  selectCompany: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveYearFilter: (year: string) => void;
  updateFailureRate: (rate: number) => void;
  addToast: (message: string, type: "success" | "error") => void;
  removeToast: (id: number) => void;
  setActiveTab: (tab: "scope" | "pcf") => void;
  addOrEditPost: (title: string, content: string, postId?: string) => Promise<boolean>;
  addOrEditProductPcf: (
    name: string,
    materialType: MaterialType,
    materialWeightKg: number,
    electricityKwh: number,
    transportMode: TransportMode,
    transportDistanceKm: number,
    transportWeightTons: number,
    productId?: string
  ) => Promise<boolean>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [productsPcf, setProductsPcf] = useState<ProductPcf[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [searchQuery, setSearchVal] = useState<string>("");
  const [activeYearFilter, setActiveYearVal] = useState<string>("2024");
  const [isSavingPost, setIsSavingPost] = useState<boolean>(false);
  const [apiFailureRate, setApiFailureRate] = useState<number>(0.15);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<"scope" | "pcf">("scope");

  // Add toast notification
  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { message, type, id }]);
    setTimeout(() => removeToast(id), 4000);
  };

  // Remove toast notification
  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const [fetchedCompanies, fetchedPosts, fetchedCountries, fetchedProductsPcf] = await Promise.all([
          fetchCompanies(),
          fetchPosts(),
          fetchCountries(),
          fetchProductsPcf()
        ]);
        
        setCompanies(fetchedCompanies);
        setPosts(fetchedPosts);
        setCountries(fetchedCountries);
        setProductsPcf(fetchedProductsPcf);
        setApiFailureRate(getMockApiFailureRate());
        
        if (fetchedCompanies.length > 0) {
          setSelectedCompanyId(fetchedCompanies[0].id);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        setError("데이터를 로드하는 중 오류가 발생했습니다. 새로고침 해주세요.");
        addToast("데이터 로드 실패!", "error");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Action: Select active company
  const selectCompany = (id: string) => {
    setSelectedCompanyId(id);
  };

  // Action: Change search query
  const setSearchQuery = (query: string) => {
    setSearchVal(query);
  };

  // Action: Change year filter
  const setActiveYearFilter = (year: string) => {
    setActiveYearVal(year);
  };

  // Action: Update failure rate
  const updateFailureRate = (rate: number) => {
    setMockApiFailureRate(rate);
    setApiFailureRate(rate);
    addToast(`API 실패율이 ${(rate * 100).toFixed(0)}%로 업데이트되었습니다.`, "success");
  };

  // Action: Add or Edit Post with Optimistic Update and Rollback
  const addOrEditPost = async (title: string, content: string, postId?: string): Promise<boolean> => {
    if (!selectedCompanyId) return false;
    
    setIsSavingPost(true);
    const originalPosts = [...posts];
    
    const currentDate = new Date();
    const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    
    const isEdit = !!postId;
    const tempId = postId || `opt_${Date.now()}`;
    
    const optimisticPost: Post = {
      id: tempId,
      title,
      content,
      resourceUid: selectedCompanyId,
      dateTime: currentYearMonth
    };

    if (isEdit) {
      setPosts((prev) => prev.map((post) => (post.id === postId ? optimisticPost : post)));
    } else {
      setPosts((prev) => [optimisticPost, ...prev]);
    }
    
    addToast(isEdit ? "게시글을 수정하는 중... (대기 중)" : "게시글을 등록하는 중... (대기 중)", "success");

    try {
      const result = await createOrUpdatePost({
        title,
        content,
        resourceUid: selectedCompanyId,
        dateTime: currentYearMonth,
        ...(isEdit && { id: postId })
      });
      
      setPosts((prev) => prev.map((post) => (post.id === tempId ? result : post)));
      addToast(isEdit ? "게시글이 성공적으로 수정되었습니다!" : "새 게시글이 등록되었습니다!", "success");
      setIsSavingPost(false);
      return true;
    } catch (err) {
      console.warn("Simulated write failure. Rolling back UI state.", err);
      setPosts(originalPosts);
      addToast("저장에 실패했습니다 (모의 에러)! UI 상태가 롤백되었습니다.", "error");
      setIsSavingPost(false);
      return false;
    }
  };

  // Action: Add or Edit Product PCF with Optimistic Update and Rollback
  const addOrEditProductPcf = async (
    name: string,
    materialType: MaterialType,
    materialWeightKg: number,
    electricityKwh: number,
    transportMode: TransportMode,
    transportDistanceKm: number,
    transportWeightTons: number,
    productId?: string
  ): Promise<boolean> => {
    if (!selectedCompanyId) return false;

    setIsSavingPost(true);
    const originalPcf = [...productsPcf];

    const isEdit = !!productId;
    const tempId = productId || `opt_pcf_${Date.now()}`;

    // Calculate optimistic PCF values locally
    const computed = calculateProductPcfData(
      materialType,
      materialWeightKg,
      electricityKwh,
      transportMode,
      transportDistanceKm,
      transportWeightTons
    );

    const optimisticProductPcf: ProductPcf = {
      id: tempId,
      name,
      companyId: selectedCompanyId,
      materialType,
      materialWeightKg,
      electricityKwh,
      transportMode,
      transportDistanceKm,
      transportWeightTons,
      calculatedPcf: computed.total,
      stages: computed.stages
    };

    // Optimistically update UI
    if (isEdit) {
      setProductsPcf((prev) => prev.map((item) => (item.id === productId ? optimisticProductPcf : item)));
    } else {
      setProductsPcf((prev) => [optimisticProductPcf, ...prev]);
    }

    addToast(
      isEdit ? "제품 PCF 데이터를 수정하는 중... (대기 중)" : "새로운 제품 PCF를 계산 및 등록하는 중... (대기 중)",
      "success"
    );

    try {
      const result = await createOrUpdateProductPcf({
        name,
        companyId: selectedCompanyId,
        materialType,
        materialWeightKg,
        electricityKwh,
        transportMode,
        transportDistanceKm,
        transportWeightTons,
        ...(isEdit && { id: productId })
      });

      setProductsPcf((prev) => prev.map((item) => (item.id === tempId ? result : item)));
      addToast(
        isEdit ? "제품 PCF 데이터가 성공적으로 수정되었습니다!" : "제품 PCF가 계산되어 성공적으로 등록되었습니다!",
        "success"
      );
      setIsSavingPost(false);
      return true;
    } catch (err) {
      console.warn("Simulated PCF save failure. Rolling back UI state.", err);
      setProductsPcf(originalPcf);
      addToast("PCF 저장에 실패했습니다 (모의 에러)! UI 상태가 롤백되었습니다.", "error");
      setIsSavingPost(false);
      return false;
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        companies,
        posts,
        countries,
        productsPcf,
        loading,
        error,
        selectedCompanyId,
        searchQuery,
        activeYearFilter,
        isSavingPost,
        apiFailureRate,
        toasts,
        activeTab,
        selectCompany,
        setSearchQuery,
        setActiveYearFilter,
        updateFailureRate,
        addToast,
        removeToast,
        setActiveTab,
        addOrEditPost,
        addOrEditProductPcf
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
