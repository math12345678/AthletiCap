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

  // Expenses
  expenses: {
    list: (skip = 0, take = 25) =>
      apiRequest('GET', `/api/expenses?skip=${skip}&take=${take}`),
    create: (data: any) => apiRequest('POST', '/api/expenses', data),
    update: (id: string, data: any) => apiRequest('PATCH', `/api/expenses/${id}`, data),
    getSummary: () => apiRequest('GET', '/api/expenses/summary'),
  },

  // Contacts
  contacts: {
    list: () => apiRequest('GET', '/api/contacts'),
    create: (data: any) => apiRequest('POST', '/api/contacts', data),
    getCAC: () => apiRequest('GET', '/api/contacts/cac'),
  },

  // Offers
  offers: {
    list: () => apiRequest('GET', '/api/offers'),
    create: (data: any) => apiRequest('POST', '/api/offers', data),
    update: (id: string, data: any) => apiRequest('PATCH', `/api/offers/${id}`, data),
    getProjection: (id: string, coaInflationRate = 0.04) =>
      apiRequest('GET', `/api/offers/${id}/projection?coaInflationRate=${coaInflationRate}`),
    compare: (ids: string[], coaInflationRate = 0.04) =>
      apiRequest('GET', `/api/offers/compare?ids=${ids.join(',')}&coaInflationRate=${coaInflationRate}`),
  },

  // Influence
  influence: {
    getBrandReadiness: () => apiRequest('GET', '/api/influence/brand-readiness'),
    getEligibility: () => apiRequest('GET', '/api/influence/eligibility'),
    acknowledgeDis closure: () => apiRequest('POST', '/api/influence/acknowledge-disclosure'),
    getSocialProfiles: () => apiRequest('GET', '/api/influence/social-profiles'),
    createSocialProfile: (data: any) => apiRequest('POST', '/api/influence/social-profiles', data),
  },

  // Dashboard
  dashboard: {
    get: () => apiRequest('GET', '/api/dashboard'),
  },
};
