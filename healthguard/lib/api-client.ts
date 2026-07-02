/**
 * API Client for HealthGuard Backend
 * Handles all HTTP requests to the backend server
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Make authenticated API requests with automatic token handling
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add auth token if available
  const token = localStorage.getItem("auth_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Include cookies for refresh tokens
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Request Failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * Authentication API endpoints
 */
export const authApi = {
  login: async (email: string, password: string) =>
    request<{
      user: {
        id: string;
        email: string;
        name: string;
        role: "ADMIN" | "DOCTOR" | "PATIENT";
        avatar?: string;
      };
      accessToken: string;
      refreshToken: string;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: async (
    email: string,
    password: string,
    name: string,
    role: string,
    hospitalName?: string
  ) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        confirmPassword: password,
        name,
        role: role.toUpperCase(),
        ...(hospitalName?.trim() ? { hospitalName: hospitalName.trim() } : {}),
      }),
    }),

  requestOtp: async (email: string, purpose = "EMAIL_VERIFICATION") =>
    request("/api/auth/request-otp", {
      method: "POST",
      body: JSON.stringify({ email, purpose }),
    }),

  requestPasswordResetOtp: async (email: string) =>
    request<{ email: string; exists: boolean; otpId?: string; purpose?: string; code?: string; expiresAt?: string }>(
      "/api/auth/request-password-reset",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    ),

  verifyPasswordResetOtp: async (email: string, otp: string) =>
    request<{ verified: true }>("/api/auth/verify-password-reset-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  resetPassword: async (email: string, otp: string, password: string, confirmPassword = password) =>
    request<{ reset: true }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, password, confirmPassword }),
    }),

  changePassword: async (currentPassword: string, newPassword: string, confirmNewPassword: string) =>
    request<{ changed: true }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
    }),

  verifyOtp: async (email: string, otp: string, purpose = "EMAIL_VERIFICATION") =>
    request("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp, purpose }),
    }),


  refreshToken: async () => {
    const token = localStorage.getItem("refresh_token");
    if (!token) {
      throw new Error("No refresh token available");
    }
    return request<{ accessToken: string }>("/api/auth/refresh-token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  logout: async () =>
    request("/api/auth/logout", {
      method: "POST",
    }),
};

/**
 * Patient API endpoints
 */
export const patientApi = {
  getProfile: async () =>
    request("/api/patient/profile", {
      method: "GET",
    }),

  updateProfile: async (data: { name?: string; avatar?: string; phone?: string; address?: string; emergencyContact?: string }) =>
    request("/api/patient/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  recordVital: async (vitals: Record<string, unknown>) =>
    request("/api/patient/vitals", {
      method: "POST",
      body: JSON.stringify(vitals),
    }),

  getVitals: async (page = 1, limit = 20) =>
    request(`/api/patient/vitals?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  getAccessRequests: async (page = 1, limit = 10) =>
    request(`/api/patient/access-requests?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  approveAccessRequest: async (requestId: string) =>
    request(`/api/patient/access-requests/${requestId}/approve`, {
      method: "POST",
    }),

  rejectAccessRequest: async (requestId: string) =>
    request(`/api/patient/access-requests/${requestId}/reject`, {
      method: "POST",
    }),

  revokeAccessRequest: async (requestId: string) =>
    request(`/api/patient/access-requests/${requestId}`, {
      method: "DELETE",
    }),

  getMedicalRecords: async (page = 1, limit = 10) =>
    request(`/api/patient/medical-records?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  getActivityLogs: async (page = 1, limit = 100) =>
    request(`/api/patient/activity?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  getAppointments: async (page = 1, limit = 20) =>
    request(`/api/patient/appointments?page=${page}&limit=${limit}`, {
      method: "GET",
    }),
};

/**
 * Doctor API endpoints
 */
export const doctorApi = {
  getProfile: async () =>
    request("/api/doctor/profile", {
      method: "GET",
    }),

  getPatients: async (page = 1, limit = 20) =>
    request(`/api/doctor/patients?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  requestAccess: async (patientId: string, reason: string, priority = "NORMAL") =>
    request("/api/doctor/access-requests", {
      method: "POST",
      body: JSON.stringify({ patientId, reason, priority }),
    }),

  getAccessRequests: async (page = 1, limit = 20) =>
    request(`/api/doctor/access-requests?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  getMonitoringSessions: async (patientId: string) =>
    request(`/api/doctor/monitoring/${patientId}`, {
      method: "GET",
    }),

  startMonitoring: async (patientId: string) =>
    request("/api/doctor/monitoring/start", {
      method: "POST",
      body: JSON.stringify({ patientId }),
    }),

  createAlert: async (patientId: string, title: string, description: string, severity: string) =>
    request("/api/doctor/alerts", {
      method: "POST",
      body: JSON.stringify({ patientId, title, description, severity }),
    }),
};

/**
 * Admin API endpoints
 */
export const adminApi = {
  getDashboardStats: async () =>
    request("/api/admin/dashboard/stats", {
      method: "GET",
    }),

  getHospitals: async (page = 1, limit = 20) =>
    request(`/api/admin/hospitals?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  createHospital: async (hospitalData: Record<string, unknown>) =>
    request("/api/admin/hospitals", {
      method: "POST",
      body: JSON.stringify(hospitalData),
    }),

  deleteHospital: async (id: string) =>
    request(`/api/admin/hospitals/${id}`, {
      method: "DELETE",
    }),

  getPersonnel: async (hospitalId: string, page = 1, limit = 20) =>
    request(`/api/admin/personnel?hospitalId=${hospitalId}&page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  invitePersonnel: async (data: { fullName: string; email: string; phone?: string; hospitalId: string; hospitalLicenseCode?: string }) =>
    request("/api/admin/personnel/invite", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSystemLogs: async (page = 1, limit = 50) =>
    request(`/api/admin/logs/system?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  getLoginHistory: async (page = 1, limit = 50) =>
    request(`/api/admin/logs/login?page=${page}&limit=${limit}`, {
      method: "GET",
    }),
};

/**
   * Notification API endpoints
   */
  export const notificationApi = {
    getNotifications: async () =>
      request("/api/notifications", {
        method: "GET",
      }),

    markRead: async (id: string) =>
      request(`/api/notifications/${id}/read`, {
        method: "POST",
      }),

    markAllRead: async () =>
      request("/api/notifications/read-all", {
        method: "POST",
      }),

    addNotification: async (n: { title: string; description: string; type: string; audience: string; link?: string }) =>
      request("/api/notifications", {
        method: "POST",
        body: JSON.stringify(n),
      }),
  };

/**
   * AI Assistant API endpoints
   */
export const aiApi = {
  createConversation: async (title?: string) =>
    request("/api/ai/conversations", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),

  sendMessage: async (conversationId: string, message: string) =>
    request(`/api/ai/conversations/${conversationId}/message`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  getConversations: async (page = 1, limit = 20) =>
    request(`/api/ai/conversations?page=${page}&limit=${limit}`, {
      method: "GET",
    }),

  getConversation: async (conversationId: string) =>
    request(`/api/ai/conversations/${conversationId}`, {
      method: "GET",
    }),

  getHealthAnalysis: async () =>
    request("/api/ai/health-analysis", {
      method: "GET",
    }),
};

/**
 * Utility function to handle token storage
 */
export function setAuthToken(token: string) {
   localStorage.setItem("auth_token", token);
}

export function setRefreshToken(token: string) {
   localStorage.setItem("refresh_token", token);
}

export function getAuthToken() {
   return localStorage.getItem("auth_token");
}
export function getRefreshToken() {
   return localStorage.getItem("refresh_token");
}

export function clearAuthToken() {
   localStorage.removeItem("auth_token");
   localStorage.removeItem("refresh_token");
}