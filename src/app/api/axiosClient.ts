const baseURL = (import.meta as any).env.VITE_API_URL || 'http://localhost:19024/api';

const axiosClient = {
  get: (url: string, config?: any) => fetch(`${baseURL}${url}`, { ...config, method: 'GET' }).then(r => r.json()),
  post: (url: string, data?: any, config?: any) => fetch(`${baseURL}${url}`, { ...config, method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(r => r.json()),
  put: (url: string, data?: any, config?: any) => fetch(`${baseURL}${url}`, { ...config, method: 'PUT', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } }).then(r => r.json()),
  delete: (url: string, config?: any) => fetch(`${baseURL}${url}`, { ...config, method: 'DELETE' }).then(r => r.json())
};

export default axiosClient;