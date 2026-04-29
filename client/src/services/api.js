import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // avoid generic network boundary errors from blocking
    if (error.code === 'ERR_NETWORK') {
      toast.error('Cannot connect to server. Make sure the backend is running on port 5000.');
      return Promise.reject(error);
    }
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const programsAPI = {
  getAll: () => api.get('/programs'),
  getByDepartment: (deptId) => api.get(`/programs/department/${deptId}`),
  create: (data) => api.post('/programs', data),
  update: (id, data) => api.put(`/programs/${id}`, data),
  delete: (id) => api.delete(`/programs/${id}`),
};

export const sectionsAPI = {
  getAll: () => api.get('/sections'),
  getByProgram: (programId) => api.get(`/sections/program/${programId}`),
  create: (data) => api.post('/sections', data),
  createBulk: (data) => api.post('/sections/bulk', data),
  update: (id, data) => api.put(`/sections/${id}`, data),
  delete: (id) => api.delete(`/sections/${id}`),
};

export const facultyAPI = {
  getAll: () => api.get('/faculty'),
  getById: (id) => api.get(`/faculty/${id}`),
  create: (data) => api.post('/faculty', data),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`),
};

export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  create: (data) => api.post('/subjects', data),
  createBulk: (data) => api.post('/subjects/bulk', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

export const roomsAPI = {
  getAll: () => api.get('/rooms'),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

export const timetableAPI = {
  getTimetable: () => api.get('/timetable'),
  getByYear: (year) => api.get(`/timetable/year/${year}`),
  getByFaculty: (id) => api.get(`/timetable/faculty/${id}`),
  getStats: () => api.get('/timetable/stats'),
  generate: () => api.post('/timetable/generate'),
  clear: () => api.delete('/timetable/clear'),
};
