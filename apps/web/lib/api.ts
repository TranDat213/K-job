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

export interface JobNote {
  id: string;
  jobId: string;
  userId: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface JobAttachment {
  id: string;
  jobId: string;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  createdAt: string;
}

export interface JobDetail extends Job {
  description: string | null;
  quantity: number | null;
  requirement: string | null;
  brief: string | null;
  receivedDate: string | null;
  demoDate: string | null;
  templateId: string | null;
  template: { id: string; name: string; scope?: string } | null;
  tasks: JobTask[];
  payments: PaymentFull[];
  notes: JobNote[];
  attachments: JobAttachment[];
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
  paymentAmount?: number;
  initialNote?: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }[];
  tasks?: {
    title: string;
    description?: string;
    order?: number;
    daysBeforePost?: number;
    dueDate?: string;
  }[];
};

export type JobsListParams = {
  page?: number;
  limit?: number;
  status?: string;
  brandId?: string;
  search?: string;
};

export interface JobStats {
  total: number;
  inProgress: number;
  completed: number;
}

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
  getStats: () => fetchApi<JobStats>('/jobs/stats'),
  getOne: (id: string) => fetchApi<JobDetail>(`/jobs/${id}`),
  create: (body: CreateJobPayload) =>
    fetchApi<JobDetail>('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: Partial<CreateJobPayload>) =>
    fetchApi<Job>(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) =>
    fetchApi(`/jobs/${id}`, { method: 'DELETE' }),
  addNote: (jobId: string, content: string) =>
    fetchApi<JobNote>(`/jobs/${jobId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  removeNote: (jobId: string, noteId: string) =>
    fetchApi(`/jobs/${jobId}/notes/${noteId}`, { method: 'DELETE' }),
  addAttachment: (
    jobId: string,
    body: { fileName: string; fileUrl: string; fileType?: string; fileSize?: number },
  ) =>
    fetchApi<JobAttachment>(`/jobs/${jobId}/attachments`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  removeAttachment: (jobId: string, attachmentId: string) =>
    fetchApi(`/jobs/${jobId}/attachments/${attachmentId}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────────────────────────
// JOB TASKS API
// ─────────────────────────────────────────────────────────────────

export interface TodayTaskItem extends JobTask {
  job: {
    id: string;
    name: string;
    brand: { id: string; name: string };
  };
}

export interface TodayTasksResponse {
  count: number;
  tasks: TodayTaskItem[];
}

export const tasksApi = {
  getAll: (jobId: string) => fetchApi<JobTask[]>(`/jobs/${jobId}/tasks`),
  getToday: () => fetchApi<TodayTasksResponse>('/tasks/today'),
  create: (jobId: string, body: { title: string; dueDate?: string; order?: number }) =>
    fetchApi<JobTask>(`/jobs/${jobId}/tasks`, { method: 'POST', body: JSON.stringify(body) }),
  update: (taskId: string, body: Partial<{ title: string; status: string; dueDate: string }>) =>
    fetchApi<JobTask>(`/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (taskId: string) =>
    fetchApi(`/tasks/${taskId}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────────────────────────
// JOB TEMPLATES API
// ─────────────────────────────────────────────────────────────────

export interface JobTemplate {
  id: string;
  name: string;
  description: string | null;
  jobType: string | null;
  scope: 'SYSTEM' | 'USER';
  ownerId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { templateTasks: number };
}

export interface TemplateTask {
  id: string;
  templateId: string;
  title: string;
  description: string | null;
  order: number;
  daysBeforePost: number;
  isRequired: boolean;
}

export interface JobTemplateDetail extends JobTemplate {
  templateTasks: TemplateTask[];
}

export type CreateTemplatePayload = {
  name: string;
  description?: string;
  jobType?: string;
};

export type CreateTemplateTaskPayload = {
  title: string;
  description?: string;
  order: number;
  daysBeforePost?: number;
  isRequired?: boolean;
};

export const templatesApi = {
  getAll: () => fetchApi<JobTemplate[]>('/job-templates'),
  getOne: (id: string) => fetchApi<JobTemplateDetail>(`/job-templates/${id}`),
  create: (body: CreateTemplatePayload) =>
    fetchApi<JobTemplate>('/job-templates', { method: 'POST', body: JSON.stringify(body) }),
  copy: (id: string) =>
    fetchApi<JobTemplateDetail>(`/job-templates/${id}/copy`, { method: 'POST' }),
  update: (id: string, body: Partial<CreateTemplatePayload>) =>
    fetchApi<JobTemplate>(`/job-templates/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => fetchApi(`/job-templates/${id}`, { method: 'DELETE' }),

  // Template tasks
  createTask: (templateId: string, body: CreateTemplateTaskPayload) =>
    fetchApi<TemplateTask>(`/job-templates/${templateId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  updateTask: (taskId: string, body: Partial<CreateTemplateTaskPayload>) =>
    fetchApi<TemplateTask>(`/template-tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  removeTask: (taskId: string) => fetchApi(`/template-tasks/${taskId}`, { method: 'DELETE' }),
};


// ─────────────────────────────────────────────────────────────────
// PAYMENTS API
// ─────────────────────────────────────────────────────────────────

export interface PaymentFull {
  id: string;
  jobId: string;
  amount: string; // Prisma Decimal serialised as string
  currency: string;
  status: string;
  expectedDate: string | null;
  paidDate: string | null;
  paymentMethod: string;
  note: string | null;
  createdAt: string;
}

export type CreatePaymentPayload = {
  amount: number;
  currency?: string;
  status?: string;
  expectedDate?: string;
  paidDate?: string;
  paymentMethod?: string;
  note?: string;
};

export interface PaymentStats {
  monthRevenue: number;
  pendingRevenue: number;
}

export const paymentsApi = {
  getStats: () => fetchApi<PaymentStats>('/payments/stats'),
  getAll: (jobId: string) => fetchApi<PaymentFull[]>(`/jobs/${jobId}/payments`),
  create: (jobId: string, body: CreatePaymentPayload) =>
    fetchApi<PaymentFull>(`/jobs/${jobId}/payments`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (paymentId: string, body: Partial<CreatePaymentPayload>) =>
    fetchApi<PaymentFull>(`/payments/${paymentId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  remove: (paymentId: string) => fetchApi(`/payments/${paymentId}`, { method: 'DELETE' }),
};
