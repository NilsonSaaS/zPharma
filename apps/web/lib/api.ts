import axios from "axios";
import type {
  HealthProfile,
  Recommendation,
  CreateProfilePayload,
  ApiResponse,
  PatientSummary,
} from "@pharmapersonal/types";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});

// Injecter le token JWT à chaque requête
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect vers /login si 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    API.post<{ token: string; user: any }>("/auth/login", { email, password }),

  register: (data: {
    email: string;
    password: string;
    pharmacy_id: string;
    role: "patient" | "pharmacist";
    first_name?: string;
    last_name?: string;
  }) => API.post<{ token: string; user: any }>("/auth/register", data),
};

// ─── Patient ──────────────────────────────────────────────
export const patientApi = {
  getProfile: () =>
    API.get<ApiResponse<HealthProfile>>("/patient/profile"),

  saveProfile: (data: CreateProfilePayload) =>
    API.post<ApiResponse<HealthProfile>>("/patient/profile", data),

  getScore: () =>
    API.get<ApiResponse<{ score: number; label: string; color: string; details: any[] }>>(
      "/patient/score"
    ),

  getRecommendations: () =>
    API.get<{ data: Recommendation[]; disclaimer: string }>(
      "/patient/recommendations"
    ),

  refreshRecommendations: () =>
    API.post<ApiResponse<any>>("/patient/recommendations/refresh"),
};

// ─── Pharmacien ───────────────────────────────────────────
export const pharmaApi = {
  getPatients: () =>
    API.get<ApiResponse<PatientSummary[]>>("/pharma/patients"),

  getPatient: (id: string) =>
    API.get<ApiResponse<any>>(`/pharma/patients/${id}`),

  addNote: (patientId: string, note: string) =>
    API.post<ApiResponse<any>>(`/pharma/patients/${patientId}/note`, { note }),

  getAlerts: () =>
    API.get<ApiResponse<{ low_score: any[]; inactive: any[] }>>("/pharma/alerts"),

  getSegments: () =>
    API.get<ApiResponse<any[]>>("/pharma/segments"),
};

// ─── Produits ─────────────────────────────────────────────
export const productApi = {
  list: () => API.get<ApiResponse<any[]>>("/products"),
  create: (data: any) => API.post<ApiResponse<any>>("/products", data),
  update: (id: string, data: any) => API.put<ApiResponse<any>>(`/products/${id}`, data),
  remove: (id: string) => API.delete(`/products/${id}`),
};

export default API;
