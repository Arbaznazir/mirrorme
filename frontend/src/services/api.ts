import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface BehaviorLog {
  id: number;
  user_id: number;
  activity_type: string;
  metadata: Record<string, any>;
  timestamp: string;
  is_sensitive: boolean;
}

export interface PersonaProfile {
  id: number;
  user_id: number;
  top_topics: string[];
  emotional_tone: Record<string, number>;
  interest_map: Record<string, any>;
  bias_score: Record<string, number>;
  persona_summary: string;
  personality_traits: string[];
  digital_avatars?: DigitalAvatar[];
  last_analysis?: string;
  data_points_count: number;
}

export interface DigitalAvatar {
  name: string;
  description: string;
  platform: string;
  emoji: string;
  personality_traits: string[];
  top_interests: string[];
  political_lean: string;
  emotional_tone: string;
  behavior_pattern: string;
  strength: number;
}

export interface HealthResponse {
  status: string;
  environment: string;
  database: string;
}

// API functions
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post<TokenResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const behaviorAPI = {
  logBehavior: async (behaviorData: {
    activity_type: string;
    metadata: Record<string, any>;
    is_sensitive?: boolean;
  }): Promise<BehaviorLog> => {
    const response = await api.post<BehaviorLog>('/behavior/log', behaviorData);
    return response.data;
  },

  getEnhancedAnalytics: async (daysBack: number = 30): Promise<{
    political_tilt: Record<string, number>;
    platform_behavior: Record<string, any>;
    sentiment_distribution: Record<string, number>;
    engagement_patterns: Record<string, number>;
    data_points: number;
    analysis_period_days: number;
  }> => {
    const response = await api.get<{
      political_tilt: Record<string, number>;
      platform_behavior: Record<string, any>;
      sentiment_distribution: Record<string, number>;
      engagement_patterns: Record<string, number>;
      data_points: number;
      analysis_period_days: number;
    }>(`/behavior/analytics/enhanced?days_back=${daysBack}`);
    return response.data;
  },

  getDigitalAvatars: async (daysBack: number = 30): Promise<{
    digital_avatars: DigitalAvatar[];
    data_points: number;
    analysis_period_days: number;
    total_avatars: number;
    message?: string;
  }> => {
    const response = await api.get<{
      digital_avatars: DigitalAvatar[];
      data_points: number;
      analysis_period_days: number;
      total_avatars: number;
      message?: string;
    }>(`/behavior/analytics/digital-avatars?days_back=${daysBack}`);
    return response.data;
  },

  exportData: async (): Promise<{
    user: User;
    behavior_logs: BehaviorLog[];
    persona_profile?: PersonaProfile;
  }> => {
    const response = await api.get<{
      user: User;
      behavior_logs: BehaviorLog[];
      persona_profile?: PersonaProfile;
    }>('/behavior/export');
    return response.data;
  },

  deleteAllData: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/behavior/delete');
    return response.data;
  },

  getAlgorithmInfluenceAnalysis: async (daysBack: number = 30) => {
    const response = await api.get(`/behavior/analytics/algorithm-influence?days_back=${daysBack}`);
    return response.data;
  },

  getTopicBiasAnalysis: async (daysBack: number = 30) => {
    const response = await api.get(`/behavior/analytics/topic-bias-detection?days_back=${daysBack}`);
    return response.data;
  },
};

export const personaAPI = {
  getProfile: async (): Promise<PersonaProfile | null> => {
    try {
      const response = await api.get<PersonaProfile>('/persona/profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  analyzePersona: async (): Promise<PersonaProfile> => {
    const response = await api.post<PersonaProfile>('/persona/analyze');
    return response.data;
  },
};

export const healthAPI = {
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await api.get<HealthResponse>('/health');
    return response.data;
  },
};

// Perception Simulator APIs
export const getPerceptionAnalysis = async (perceiverType: string) => {
  const response = await api.get(`/behavior/analytics/perception-analysis/${perceiverType}`);
  return response.data;
};

export const getPerceptionComparison = async () => {
  const response = await api.get('/behavior/analytics/perception-comparison');
  return response.data;
};

export const getPerceptionRecommendations = async () => {
  const response = await api.get('/behavior/analytics/perception-recommendations');
  return response.data;
};

export default api; 