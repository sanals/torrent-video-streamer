// HTTP client service for Torrent Video Streamer
import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosRequestConfig, CancelTokenSource } from 'axios';

// Create Axios instance with base config
const api: AxiosInstance = axios.create({
  baseURL: '', // Set base URL when integrating with real API
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    // eslint-disable-next-line no-console
    console.log('[API Request]', config.method?.toUpperCase(), config.url, config.params || config.data);
    return config;
  },
  (error) => {
    // eslint-disable-next-line no-console
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    // eslint-disable-next-line no-console
    console.log('[API Response]', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    // eslint-disable-next-line no-console
    console.error('[API Response Error]', error);
    return Promise.reject(error);
  }
);

// Retry logic for failed requests
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries) await new Promise(res => setTimeout(res, delay));
    }
  }
  throw lastError;
}

// Typed API methods (example: GET)
export async function apiGet<T>(url: string, config?: AxiosRequestConfig, retries = 2, cancelToken?: CancelTokenSource): Promise<T> {
  return withRetry(async () => {
    const finalConfig = { ...config };
    if (cancelToken) finalConfig.cancelToken = cancelToken.token;
    const response: AxiosResponse<T> = await api.get(url, finalConfig);
    return response.data;
  }, retries);
}

// Typed API methods (example: POST)
export async function apiPost<T>(url: string, data?: any, config?: AxiosRequestConfig, retries = 2, cancelToken?: CancelTokenSource): Promise<T> {
  return withRetry(async () => {
    const finalConfig = { ...config };
    if (cancelToken) finalConfig.cancelToken = cancelToken.token;
    const response: AxiosResponse<T> = await api.post(url, data, finalConfig);
    return response.data;
  }, retries);
}

// Request cancellation support
export function createCancelToken(): CancelTokenSource {
  return axios.CancelToken.source();
}

export default api;