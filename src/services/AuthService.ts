import axios, { AxiosRequestConfig } from "axios";
import { UserProfileToken } from "../types/User";
import { API_BASE_URL } from "~/utils/API";
import { handleError } from "~/utils/handleError";


export const registerAPI = async (email:string, username: string, password: string, confirmPassword: string) => {
    try {
        const data = await axios.post<UserProfileToken>(API_BASE_URL + "accounts/register", {
            email: email,   
            username: username,
            password: password,
            confirmPassword: confirmPassword
        });
        return data;
    } catch (error) {
        handleError(error);
    }
};


export const loginAPI = async (email: string, password: string) => {
    try {
        const data = await axios.post<UserProfileToken>(API_BASE_URL + "accounts/login", { 
            email: email,
            password: password 
        });
        return data;
    } catch (error) {
        handleError(error);
    }
};

const TOKEN_KEY = 'authToken';

export const storeToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    console.error('Invalid token format');
    return false;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT structure');
      return false;
    }

    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
};

export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (!token || token.split('.').length !== 3) {
      removeToken();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

export const parseTokenPayload = (): any | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    if (!payload.exp || !payload.sub) {
      console.error('Token missing required claims');
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

export const isTokenValid = (): boolean => {
  const payload = parseTokenPayload();
  if (!payload) return false;

  // Check expiration (payload.exp is in seconds)
  return Date.now() < payload.exp * 1000;
};

export const getAuthHeaders = (): AxiosRequestConfig => {
    const token = localStorage.getItem('token'); 
    
    // Nếu token không tồn tại, trả về cấu hình không có Authorization header.
    // Các hàm service sẽ kiểm tra sự tồn tại của token.
    if (!token) {
        // Trong môi trường React, thường bạn nên kiểm tra isLoggedIn() ở component
        // trước khi gọi service. Tuy nhiên, đây là một lớp bảo vệ an toàn.
        return {}; 
    }
    
    return {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
};