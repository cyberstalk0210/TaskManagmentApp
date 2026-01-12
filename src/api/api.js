import axios from 'axios';

const API_URL = 'http://localhost:8080/api/tasks';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response received:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error - No response received:', {
        url: error.config?.url,
        message: 'Please check if the backend server is running'
      });
    } else {
      // Something else happened
      console.error('Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const taskService = {
  getTasks: async () => {
    try {
      const response = await apiClient.get('');
      return response;
    } catch (error) {
      throw error;
    }
  },

  createTask: async (data) => {
    try {
      console.log('Creating task with data:', data);
      console.log('Task status being sent:', data.status);
      const response = await apiClient.post('', data);
      console.log('Task created successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  updateTask: async (id, data) => {
    try {
      const response = await apiClient.put(`/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const response = await apiClient.delete(`/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};