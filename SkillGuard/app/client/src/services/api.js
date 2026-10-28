const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  let data = null;
  const bodyText = await res.text();

  if (bodyText) {
    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(bodyText);
      } catch {
        throw new Error(`The server returned invalid JSON (HTTP ${res.status}). Check the backend terminal.`);
      }
    } else {
      const preview = bodyText.trim().slice(0, 120);
      if (!res.ok) {
        throw new Error(`API request failed (HTTP ${res.status}). The server returned a non-JSON response. Check that the backend is running on port 5000 and the Vite /api proxy is active.`);
      }
      throw new Error(`Expected JSON from the API but received ${contentType || 'an unknown content type'}. Check the API URL and backend routes. Response: ${preview}`);
    }
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed with HTTP ${res.status}.`);
  }
  if (data === null) {
    throw new Error(`The API returned an empty response (HTTP ${res.status}). Check the backend route and server logs.`);
  }
  return data;
};

export const api = {
  // Authentication
  auth: {
    login: async (credentials) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return handleResponse(res);
    },
    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Courses
  courses: {
    getAll: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.difficulty && filters.difficulty !== 'All') params.append('difficulty', filters.difficulty);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/courses${queryString}`);
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getCategories: async () => {
      const res = await fetch(`${API_BASE}/courses/categories/list`);
      return handleResponse(res);
    },
    create: async (courseData) => {
      const res = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(courseData)
      });
      return handleResponse(res);
    },
    update: async (id, courseData) => {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(courseData)
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Enrolments & Progress
  enrolments: {
    enrol: async (courseId) => {
      const res = await fetch(`${API_BASE}/enrolments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ courseId })
      });
      return handleResponse(res);
    },
    getMyEnrolments: async () => {
      const res = await fetch(`${API_BASE}/enrolments/my-enrolments`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getCourseEnrolment: async (courseId) => {
      const res = await fetch(`${API_BASE}/enrolments/course/${courseId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    toggleLesson: async (courseId, lessonId, status) => {
      const res = await fetch(`${API_BASE}/enrolments/course/${courseId}/lesson/${lessonId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    }
  },

  // Exams, proctoring events and certificates
  exams: {
    listForCourse: async (courseId) => handleResponse(await fetch(`${API_BASE}/exams/course/${courseId}`, { headers: getHeaders() })),
    get: async (examId) => handleResponse(await fetch(`${API_BASE}/exams/${examId}`, { headers: getHeaders() })),
    create: async (payload) => handleResponse(await fetch(`${API_BASE}/exams`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) })),
    start: async (examId) => handleResponse(await fetch(`${API_BASE}/exams/${examId}/start`, { method: 'POST', headers: getHeaders() })),
    log: async (examId, payload) => handleResponse(await fetch(`${API_BASE}/exams/${examId}/activity`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) })),
    submit: async (attemptId, answers) => handleResponse(await fetch(`${API_BASE}/exams/attempt/${attemptId}/submit`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ answers }) })),
    issueCertificate: async (attemptId) => handleResponse(await fetch(`${API_BASE}/exams/attempt/${attemptId}/certificate`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({}) })),
    myAttempts: async () => handleResponse(await fetch(`${API_BASE}/exams/mine/attempts`, { headers: getHeaders() })),
    myCertificates: async () => handleResponse(await fetch(`${API_BASE}/exams/mine/certificates`, { headers: getHeaders() })),
    activities: async () => handleResponse(await fetch(`${API_BASE}/exams/admin/activities`, { headers: getHeaders() })),
    verify: async (id) => handleResponse(await fetch(`${API_BASE}/exams/verify/${id}`)),
    downloadCertificate: async (id) => { const r = await fetch(`${API_BASE}/certificates/${id}/pdf`, { headers: getHeaders() }); if (!r.ok) { const d = await r.json().catch(()=>({})); throw new Error(d.message || 'Certificate download failed'); } const blob = await r.blob(); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`SkillGuard-${id}.pdf`; a.click(); URL.revokeObjectURL(url); },
    getCertificateByCourse: async (courseId) => {
      const res = await fetch(`${API_BASE}/certificates/course/${courseId}`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  },

  // Admin Portal
  admin: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getStudents: async () => {
      const res = await fetch(`${API_BASE}/admin/students`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    },
    getAllEnrolments: async () => {
      const res = await fetch(`${API_BASE}/admin/enrolments`, {
        headers: getHeaders()
      });
      return handleResponse(res);
    }
  }
};
