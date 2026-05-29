const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: any,
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API error');
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    getMe: () => apiRequest('GET', '/api/auth/me'),
    onboarding: (data: any) => apiRequest('POST', '/api/auth/onboarding', data),
  },

  // Profile
  profile: {
    get: () => apiRequest('GET', '/api/profile'),
    create: (data: any) => apiRequest('POST', '/api/profile', data),
    update: (data: any) => apiRequest('PATCH', '/api/profile', data),
    loadDemo: () => apiRequest('POST', '/api/profile/load-demo'),
  },

  // Expenses
  expenses: {
    list: () => apiRequest('GET', '/api/expenses'),
    create: (data: any) => apiRequest('POST', '/api/expenses', data),
    update: (id: string, data: any) => apiRequest('PATCH', `/api/expenses/${id}`, data),
    delete: (id: string) => apiRequest('DELETE', `/api/expenses/${id}`),
    getByCategorySum: () => apiRequest('GET', '/api/expenses/summary/by-category'),
    getAdvisor: () => apiRequest('GET', '/api/expenses/advisor'),
  },

  // Contacts
  contacts: {
    list: () => apiRequest('GET', '/api/contacts'),
    create: (data: any) => apiRequest('POST', '/api/contacts', data),
    update: (id: string, data: any) => apiRequest('PATCH', `/api/contacts/${id}`, data),
    delete: (id: string) => apiRequest('DELETE', `/api/contacts/${id}`),
    getPipelineSummary: () => apiRequest('GET', '/api/contacts/summary/pipeline'),
  },

  // Offers
  offers: {
    list: () => apiRequest('GET', '/api/offers'),
    create: (data: any) => apiRequest('POST', '/api/offers', data),
    update: (id: string, data: any) => apiRequest('PATCH', `/api/offers/${id}`, data),
    delete: (id: string) => apiRequest('DELETE', `/api/offers/${id}`),
    commit: (id: string) => apiRequest('POST', `/api/offers/${id}/commit`),
  },

  // Influence
  influence: {
    getBrandReadiness: () => apiRequest('GET', '/api/influence/brand-readiness'),
    getEligibility: () => apiRequest('GET', '/api/influence/eligibility'),
    acknowledgeDisclosure: () => apiRequest('POST', '/api/influence/acknowledge-disclosure'),
    getSocialProfiles: () => apiRequest('GET', '/api/influence/social-profiles'),
    createSocialProfile: (data: any) => apiRequest('POST', '/api/influence/social-profiles', data),
  },

  // Dashboard
  dashboard: {
    getSummary: () => apiRequest('GET', '/api/dashboard/summary'),
    getPrediction: () => apiRequest('GET', '/api/dashboard/prediction'),
  },

  // Schools/Matching
  schools: {
    getMatches: (params?: { division?: string; state?: string; setting?: string }) => {
      const query = new URLSearchParams();
      if (params?.division) query.append('division', params.division);
      if (params?.state) query.append('state', params.state);
      if (params?.setting) query.append('setting', params.setting);
      const queryStr = query.toString();
      return apiRequest('GET', `/api/schools/matches${queryStr ? '?' + queryStr : ''}`);
    },
    addToWatchlist: (schoolId: number, notes?: string) =>
      apiRequest('POST', '/api/schools/watchlist', { schoolId, notes }),
    removeFromWatchlist: (schoolId: number) =>
      apiRequest('DELETE', `/api/schools/watchlist/${schoolId}`),
    getWatchlist: () => apiRequest('GET', '/api/schools/watchlist'),
  },

  // Milestones
  milestones: {
    list: () => apiRequest('GET', '/api/milestones'),
    complete: (id: string, data?: any) => apiRequest('POST', `/api/milestones/${id}/complete`, data || {}),
  },

  // Budget Advisor
  budgetAdvisor: {
    getAnalysis: () => apiRequest('GET', '/api/expenses/advisor'),
  },
};
