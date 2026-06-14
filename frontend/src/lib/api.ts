export const API_BASE_URL = 'http://127.0.0.1:8081/api/v1';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: `Server error ${response.status}: ${responseText.substring(0, 100)}` };
      }

      if (response.status === 401) {
        throw new Error(errorData.message || 'Unauthorized access');
      }

      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    try {
      return responseText ? JSON.parse(responseText) : null;
    } catch (e) {
      throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}`);
    }
  } catch (error: any) {
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Could not connect to the server. Please ensure the backend is running.');
    }
    throw error;
  }
}

/** Fetches a binary response as a Blob (for CSV/Excel downloads). */
export async function apiGetBlob(endpoint: string): Promise<Blob> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
  if (!response.ok) throw new Error(`Export failed: ${response.status}`);
  return response.blob();
}

// ─────────────────────────────────────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────────────────────────────────────

export const getMyProfile = () => apiFetch('/users/me');
export const updateMyProfile = (body: object) =>
  apiFetch('/users/me', { method: 'PUT', body: JSON.stringify(body) });

export const getUsers = (params?: { role?: string; status?: string }) => {
  const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString() : '';
  return apiFetch(`/users${qs}`);
};
export const getUser = (id: string) => apiFetch(`/users/${id}`);
export const createUser = (body: object) =>
  apiFetch('/users', { method: 'POST', body: JSON.stringify(body) });
export const updateUser = (id: string, body: object) =>
  apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const updateUserStatus = (id: string, status: string) =>
  apiFetch(`/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

export const getBranding = () => apiFetch('/config/branding');
export const updateBranding = (body: object) =>
  apiFetch('/config/branding', { method: 'PUT', body: JSON.stringify(body) });

export const getCycles = () => apiFetch('/config/cycles');
export const getActiveCycle = () => apiFetch('/config/cycles/active');
export const createCycle = (body: object) =>
  apiFetch('/config/cycles', { method: 'POST', body: JSON.stringify(body) });
export const updateCycle = (id: string, body: object) =>
  apiFetch(`/config/cycles/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const getDeadlines = (cycleId: string) => apiFetch(`/config/cycles/${cycleId}/deadlines`);
export const upsertDeadline = (cycleId: string, body: object) =>
  apiFetch(`/config/cycles/${cycleId}/deadlines`, { method: 'POST', body: JSON.stringify(body) });
export const deleteDeadline = (cycleId: string, id: string) =>
  apiFetch(`/config/cycles/${cycleId}/deadlines/${id}`, { method: 'DELETE' });

export const getWorkflowConfigs = () => apiFetch('/config/workflow');
export const upsertWorkflow = (body: object) =>
  apiFetch('/config/workflow', { method: 'POST', body: JSON.stringify(body) });
export const deleteWorkflow = (id: string) =>
  apiFetch(`/config/workflow/${id}`, { method: 'DELETE' });

export const getFormSections = () => apiFetch('/config/form/sections');
export const createSection = (body: object) =>
  apiFetch('/config/form/sections', { method: 'POST', body: JSON.stringify(body) });
export const updateSection = (id: string, body: object) =>
  apiFetch(`/config/form/sections/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteSection = (id: string) =>
  apiFetch(`/config/form/sections/${id}`, { method: 'DELETE' });

export const getFields = (sectionId: string) =>
  apiFetch(`/config/form/sections/${sectionId}/fields`);
export const createField = (sectionId: string, body: object) =>
  apiFetch(`/config/form/sections/${sectionId}/fields`, { method: 'POST', body: JSON.stringify(body) });
export const updateField = (id: string, body: object) =>
  apiFetch(`/config/form/fields/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteField = (id: string) =>
  apiFetch(`/config/form/fields/${id}`, { method: 'DELETE' });

export const getTerminology = (language?: string) =>
  apiFetch(language ? `/config/terminology?language=${language}` : '/config/terminology');
export const upsertTerm = (body: object) =>
  apiFetch('/config/terminology', { method: 'PUT', body: JSON.stringify(body) });
export const deleteTerm = (key: string) =>
  apiFetch(`/config/terminology/${key}`, { method: 'DELETE' });

// ─────────────────────────────────────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────────────────────────────────────

export const getMyNotifications = () => apiFetch('/notifications/my');
export const getNotificationTemplates = () => apiFetch('/notifications/templates');
export const getNotificationTemplate = (id: string) => apiFetch(`/notifications/templates/${id}`);
export const updateNotificationTemplate = (id: string, body: object) =>
  apiFetch(`/notifications/templates/${id}`, { method: 'PUT', body: JSON.stringify(body) });

// ─────────────────────────────────────────────────────────────────────────────
// Audit
// ─────────────────────────────────────────────────────────────────────────────

export const getAuditLog = (page = 0, size = 50) =>
  apiFetch(`/audit?page=${page}&size=${size}`);
export const searchAudit = (params: Record<string, string>) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return apiFetch(`/audit/search${qs ? '?' + qs : ''}`);
};
export const getEntityAudit = (type: string, id: string) =>
  apiFetch(`/audit/entity/${type}/${id}`);

// ─────────────────────────────────────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────────────────────────────────────

export const exportReport = (report: string, format: string, academicYear?: string) =>
  apiGetBlob(`/reports/export?report=${report}&format=${format}${academicYear ? '&academicYear=' + academicYear : ''}`);

// ─────────────────────────────────────────────────────────────────────────────
// Decisions & Committee
// ─────────────────────────────────────────────────────────────────────────────

export const getDecision = (applicationId: string) => apiFetch(`/decisions/${applicationId}`);
export const recordDecision = (body: object) =>
  apiFetch('/decisions', { method: 'POST', body: JSON.stringify(body) });
export const getDecisionLetter = (applicationId: string) =>
  apiFetch(`/decisions/${applicationId}/letter`);
export const getDecisionHistory = (applicationId: string) =>
  apiFetch(`/decisions/${applicationId}/history`);

export const submitCommitteeInput = (body: object) =>
  apiFetch('/committee-reviews', { method: 'POST', body: JSON.stringify(body) });
export const getCommitteeReviews = (applicationId: string) =>
  apiFetch(`/committee-reviews/${applicationId}`);

// ─────────────────────────────────────────────────────────────────────────────
// Enrollment (registrar)
// ─────────────────────────────────────────────────────────────────────────────

export const getAllEnrollments = () => apiFetch('/enrollments');
export const reviewEnrollment = (id: string) =>
  apiFetch(`/enrollments/${id}/review`, { method: 'POST' });
export const completeEnrollment = (id: string) =>
  apiFetch(`/enrollments/${id}/complete`, { method: 'POST' });
export const getEnrollmentByOffer = (offerId: string) =>
  apiFetch(`/enrollments/offer/${offerId}`);

// ─────────────────────────────────────────────────────────────────────────────
// Interviews
// ─────────────────────────────────────────────────────────────────────────────

export const getInterviewByApplication = (applicationId: string) =>
  apiFetch(`/interviews/application/${applicationId}`);
export const getInterviewIcalUrl = (interviewId: string) =>
  `${API_BASE_URL}/interviews/${interviewId}/ical`;
