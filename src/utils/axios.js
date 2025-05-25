import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('firebaseToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Dependency injection for logout, notify, and router
let logoutFn = null;
let notifyFn = null;
let routerObj = null;

export function injectAxiosUtils({ logout, notify, router }) {
  logoutFn = logout;
  notifyFn = notify;
  routerObj = router;
}

// Response interceptor: handle invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      logoutFn &&
      notifyFn &&
      routerObj
    ) {
      logoutFn();
      notifyFn('Invalid session. Login Again', 'error');
      routerObj.push('/');
    }
    return Promise.reject(error);
  }
);

export default api;