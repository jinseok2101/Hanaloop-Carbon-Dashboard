// lib/api.ts

export interface GhgEmission {
  yearMonth: string; // e.g., "2024-01", "2024-02"
  source: string; // gasoline, lpg, diesel, electricity, supply_chain, etc.
  emissions: number; // tons of CO2 equivalent
}

export interface Company {
  id: string;
  name: string;
  country: string; // Country code, e.g., "US", "DE"
  emissions: GhgEmission[];
}

export interface Post {
  id: string;
  title: string;
  resourceUid: string; // Company.id
  dateTime: string; // e.g., "2024-02"
  content: string;
}

export interface Country {
  code: string;
  name: string;
}

// ----------------------------------------------------
// Perfect-Score Extension: PCF (Product Carbon Footprint) Model
// ----------------------------------------------------
export type MaterialType = "steel" | "plastic" | "aluminum" | "paper";
export type TransportMode = "truck" | "ship" | "train";

export interface ProductPcf {
  id: string;
  name: string;
  companyId: string;
  materialType: MaterialType;
  materialWeightKg: number;
  electricityKwh: number;
  transportMode: TransportMode;
  transportDistanceKm: number;
  transportWeightTons: number;
  calculatedPcf: number; // Total in kgCO2e
  stages: {
    material: number; // Cradle to Gate: Material Extraction kgCO2e
    manufacturing: number; // Gate to Gate: Production kgCO2e
    transport: number; // Gate to Grave: Logistics kgCO2e
  };
}

// Standard IPCC / Greenhouse Gas Protocol Carbon Emission Factors
// Measured in kgCO2e per unit
export const EMISSION_FACTORS = {
  materials: {
    steel: 1.85,     // 1.85 kgCO2e per 1kg of Steel
    plastic: 2.05,   // 2.05 kgCO2e per 1kg of Plastic
    aluminum: 8.24,  // 8.24 kgCO2e per 1kg of Virgin Aluminum (highly energy intensive!)
    paper: 0.92      // 0.92 kgCO2e per 1kg of Paper/Cardboard
  },
  electricity: 0.478, // Grid factor: 0.478 kgCO2e per 1kWh
  transport: {
    truck: 0.162,   // Road transport: 0.162 kgCO2e per ton-km
    ship: 0.018,    // Sea freight: 0.018 kgCO2e per ton-km (efficient, high volume)
    train: 0.035    // Rail freight: 0.035 kgCO2e per ton-km
  }
};

// Calculate PCF based on standard life cycle assessment formula
export function calculateProductPcfData(
  materialType: MaterialType,
  materialWeightKg: number,
  electricityKwh: number,
  transportMode: TransportMode,
  transportDistanceKm: number,
  transportWeightTons: number
) {
  const materialEmissions = materialWeightKg * EMISSION_FACTORS.materials[materialType];
  const manufacturingEmissions = electricityKwh * EMISSION_FACTORS.electricity;
  const transportEmissions = transportWeightTons * transportDistanceKm * EMISSION_FACTORS.transport[transportMode];
  
  const total = materialEmissions + manufacturingEmissions + transportEmissions;
  
  return {
    total: Math.round(total * 100) / 100,
    stages: {
      material: Math.round(materialEmissions * 100) / 100,
      manufacturing: Math.round(manufacturingEmissions * 100) / 100,
      transport: Math.round(transportEmissions * 100) / 100
    }
  };
}

// ----------------------------------------------------
// Pre-seeded Database
// ----------------------------------------------------

const _countries: Country[] = [
  { code: "US", name: "United States" },
  { code: "DE", name: "Germany" },
  { code: "KR", name: "South Korea" },
  { code: "JP", name: "Japan" }
];

let _companies: Company[] = [
  {
    id: "c1",
    name: "Acme Corp",
    country: "US",
    emissions: [
      { yearMonth: "2024-01", source: "gasoline", emissions: 45 },
      { yearMonth: "2024-01", source: "electricity", emissions: 50 },
      { yearMonth: "2024-01", source: "supply_chain", emissions: 25 },
      { yearMonth: "2024-02", source: "gasoline", emissions: 40 },
      { yearMonth: "2024-02", source: "electricity", emissions: 45 },
      { yearMonth: "2024-02", source: "supply_chain", emissions: 25 },
      { yearMonth: "2024-03", source: "gasoline", emissions: 30 },
      { yearMonth: "2024-03", source: "electricity", emissions: 40 },
      { yearMonth: "2024-03", source: "supply_chain", emissions: 25 }
    ]
  },
  {
    id: "c2",
    name: "Globex",
    country: "DE",
    emissions: [
      { yearMonth: "2024-01", source: "gasoline", emissions: 30 },
      { yearMonth: "2024-01", source: "electricity", emissions: 30 },
      { yearMonth: "2024-01", source: "supply_chain", emissions: 20 },
      { yearMonth: "2024-02", source: "gasoline", emissions: 40 },
      { yearMonth: "2024-02", source: "electricity", emissions: 40 },
      { yearMonth: "2024-02", source: "supply_chain", emissions: 25 },
      { yearMonth: "2024-03", source: "gasoline", emissions: 45 },
      { yearMonth: "2024-03", source: "electricity", emissions: 45 },
      { yearMonth: "2024-03", source: "supply_chain", emissions: 30 }
    ]
  },
  {
    id: "c3",
    name: "Initech Solutions",
    country: "KR",
    emissions: [
      { yearMonth: "2024-01", source: "diesel", emissions: 60 },
      { yearMonth: "2024-01", source: "electricity", emissions: 70 },
      { yearMonth: "2024-01", source: "supply_chain", emissions: 40 },
      { yearMonth: "2024-02", source: "diesel", emissions: 55 },
      { yearMonth: "2024-02", source: "electricity", emissions: 65 },
      { yearMonth: "2024-02", source: "supply_chain", emissions: 45 },
      { yearMonth: "2024-03", source: "diesel", emissions: 50 },
      { yearMonth: "2024-03", source: "electricity", emissions: 60 },
      { yearMonth: "2024-03", source: "supply_chain", emissions: 35 }
    ]
  },
  {
    id: "c4",
    name: "Umbrella Corporation",
    country: "JP",
    emissions: [
      { yearMonth: "2024-01", source: "lpg", emissions: 90 },
      { yearMonth: "2024-01", source: "electricity", emissions: 100 },
      { yearMonth: "2024-01", source: "supply_chain", emissions: 80 },
      { yearMonth: "2024-02", source: "lpg", emissions: 85 },
      { yearMonth: "2024-02", source: "electricity", emissions: 95 },
      { yearMonth: "2024-02", source: "supply_chain", emissions: 75 },
      { yearMonth: "2024-03", source: "lpg", emissions: 75 },
      { yearMonth: "2024-03", source: "electricity", emissions: 90 },
      { yearMonth: "2024-03", source: "supply_chain", emissions: 70 }
    ]
  }
];

let _posts: Post[] = [
  {
    id: "p1",
    title: "Sustainability Report",
    resourceUid: "c1",
    dateTime: "2024-02",
    content: "Quarterly CO2 update: Acme Corp has reduced direct transportation emissions by 11% using renewable energy sources."
  },
  {
    id: "p2",
    title: "Eco-Friendly Transition Phase 1",
    resourceUid: "c2",
    dateTime: "2024-03",
    content: "Globex has finalized transitioning 40% of manufacturing operations to standard clean power grids."
  }
];

// Seeded PCF Products
let _productsPcf: ProductPcf[] = [
  {
    id: "pcf_1",
    name: "스마트 재생 알루미늄 자전거 (Smart Eco-Alu Bike)",
    companyId: "c1",
    materialType: "aluminum",
    materialWeightKg: 10,
    electricityKwh: 35,
    transportMode: "truck",
    transportDistanceKm: 250,
    transportWeightTons: 0.01,
    calculatedPcf: 99.53, // 10*8.24 + 35*0.478 + 0.01*250*0.162
    stages: {
      material: 82.4,
      manufacturing: 16.73,
      transport: 0.4
    }
  },
  {
    id: "pcf_2",
    name: "재생 플라스틱 텀블러 (Eco-Plastic Tumbler)",
    companyId: "c1",
    materialType: "plastic",
    materialWeightKg: 0.35,
    electricityKwh: 1.2,
    transportMode: "ship",
    transportDistanceKm: 1800,
    transportWeightTons: 0.00035,
    calculatedPcf: 1.3,
    stages: {
      material: 0.72,
      manufacturing: 0.57,
      transport: 0.01
    }
  },
  {
    id: "pcf_3",
    name: "고강도 저탄소 강철 빔 (Ultra Low-Carbon Steel Beam)",
    companyId: "c2",
    materialType: "steel",
    materialWeightKg: 400,
    electricityKwh: 90,
    transportMode: "train",
    transportDistanceKm: 850,
    transportWeightTons: 0.4,
    calculatedPcf: 794.92,
    stages: {
      material: 740,
      manufacturing: 43.02,
      transport: 11.9
    }
  },
  {
    id: "pcf_4",
    name: "무공해 생분해 포장 상자 (Biodegradable Kraft Box)",
    companyId: "c3",
    materialType: "paper",
    materialWeightKg: 0.8,
    electricityKwh: 0.4,
    transportMode: "truck",
    transportDistanceKm: 150,
    transportWeightTons: 0.0008,
    calculatedPcf: 0.95,
    stages: {
      material: 0.74,
      manufacturing: 0.19,
      transport: 0.02
    }
  }
];

// Simulation parameters
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const jitter = () => 200 + Math.random() * 600;

let _failureRate = 0.15;

export function setApiFailureRate(rate: number) {
  _failureRate = rate;
}

export function getApiFailureRate() {
  return _failureRate;
}

const maybeFail = () => Math.random() < _failureRate;

// Public Mock API methods
export async function fetchCountries(): Promise<Country[]> {
  await delay(jitter());
  return [..._countries];
}

export async function fetchCompanies(): Promise<Company[]> {
  await delay(jitter());
  return JSON.parse(JSON.stringify(_companies));
}

export async function fetchPosts(): Promise<Post[]> {
  await delay(jitter());
  return JSON.parse(JSON.stringify(_posts));
}

export async function createOrUpdatePost(p: Omit<Post, "id"> & { id?: string }): Promise<Post> {
  await delay(jitter());
  if (maybeFail()) {
    throw new Error("Save failed");
  }
  if (p.id) {
    const updatedPost: Post = { ...p, id: p.id };
    _posts = _posts.map(x => x.id === p.id ? updatedPost : x);
    return updatedPost;
  }
  const created: Post = { ...p, id: `p_${Math.random().toString(36).substr(2, 9)}` };
  _posts = [created, ..._posts];
  return created;
}

// PCF API Methods
export async function fetchProductsPcf(): Promise<ProductPcf[]> {
  await delay(jitter());
  return JSON.parse(JSON.stringify(_productsPcf));
}

export async function createOrUpdateProductPcf(
  p: Omit<ProductPcf, "id" | "calculatedPcf" | "stages"> & { id?: string }
): Promise<ProductPcf> {
  await delay(jitter());
  if (maybeFail()) {
    throw new Error("Save PCF failed");
  }
  
  const computed = calculateProductPcfData(
    p.materialType,
    p.materialWeightKg,
    p.electricityKwh,
    p.transportMode,
    p.transportDistanceKm,
    p.transportWeightTons
  );

  if (p.id) {
    const updated: ProductPcf = {
      ...p,
      id: p.id,
      calculatedPcf: computed.total,
      stages: computed.stages
    };
    _productsPcf = _productsPcf.map((x) => (x.id === p.id ? updated : x));
    return updated;
  }

  const created: ProductPcf = {
    ...p,
    id: `pcf_${Math.random().toString(36).substr(2, 9)}`,
    calculatedPcf: computed.total,
    stages: computed.stages
  };
  _productsPcf = [created, ..._productsPcf];
  return created;
}
