const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode?: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Automatically send/receive httpOnly cookies
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Đã có lỗi xảy ra');
  }

  return data;
}

export const authApi = {
  register: (body: { email: string; password: string; name: string; phone?: string }) =>
    fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () =>
    fetchApi('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    fetchApi('/auth/me', {
      method: 'GET',
    }),
};

// ─────────────────────────────────────────────────────────────────
// BRANDS API
// ─────────────────────────────────────────────────────────────────

export interface Brand {
  id: string;
  name: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { jobs: number };
}

export type CreateBrandPayload = {
  name: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  note?: string;
};

export const brandsApi = {
  getAll: () => fetchApi<Brand[]>('/brands'),
  getOne: (id: string) => fetchApi<Brand>(`/brands/${id}`),
  create: (body: CreateBrandPayload) =>
    fetchApi<Brand>('/brands', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<CreateBrandPayload>) =>
    fetchApi<Brand>(`/brands/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) =>
    fetchApi(`/brands/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────────────────────────
// JOBS API
// ─────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  name: string;
  status: string;
  jobType: string;
  postDate: string | null;
  paymentExpectedDate: string | null;
  createdAt: string;
  brand: { id: string; name: string };
  _count?: { tasks: number };
}

export interface JobDetail extends Job {
  description: string | null;
  quantity: number | null;
  requirement: string | null;
  brief: string | null;
  receivedDate: string | null;
  demoDate: string | null;
  templateId: string | null;
  template: { id: string; name: string } | null;
  tasks: JobTask[];
  payments: Payment[];
}

export interface JobTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  order: number;
}

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  status: string;
  expectedDate: string | null;
  paidDate: string | null;
  paymentMethod: string;
  note: string | null;
}

export type CreateJobPayload = {
  brandId: string;
  name: string;
  description?: string;
  jobType?: string;
  status?: string;
  templateId?: string;
  quantity?: number;
  requirement?: string;
  brief?: string;
  receivedDate?: string;
  demoDate?: string;
  postDate?: string;
  paymentExpectedDate?: string;
};

export type JobsListParams = {
  page?: number;
  limit?: number;
  status?: string;
  brandId?: string;
  search?: string;
};

export const jobsApi = {
  getAll: (params: JobsListParams = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.status) qs.set('status', params.status);
    if (params.brandId) qs.set('brandId', params.brandId);
    if (params.search) qs.set('search', params.search);
    const query = qs.toString();
    return fetchApi<Job[]>(`/jobs${query ? `?${query}` : ''}`);
  },
  getOne: (id: string) => fetchApi<JobDetail>(`/jobs/${id}`),
  create: (body: CreateJobPayload) =>
    fetchApi<JobDetail>('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<CreateJobPayload>) =>
    fetchApi<Job>(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) =>
    fetchApi(`/jobs/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────────────────────────
// JOB TASKS API
// ─────────────────────────────────────────────────────────────────

export const tasksApi = {
  getAll: (jobId: string) => fetchApi<JobTask[]>(`/jobs/${jobId}/tasks`),
  create: (jobId: string, body: { title: string; dueDate?: string; order?: number }) =>
    fetchApi<JobTask>(`/jobs/${jobId}/tasks`, { method: 'POST', body: JSON.stringify(body) }),
  update: (taskId: string, body: Partial<{ title: string; status: string; dueDate: string }>) =>
    fetchApi<JobTask>(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (taskId: string) =>
    fetchApi(`/tasks/${taskId}`, { method: 'DELETE' }),
};

