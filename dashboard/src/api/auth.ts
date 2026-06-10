import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    fullName: string;
    role: string;
    mustChangePassword: boolean;
  };
}

export const login = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
};

export const saveToken = (token: string) => {
  localStorage.setItem('qatrack_token', token);
};

export const getToken = () => {
  return localStorage.getItem('qatrack_token');
};

export const saveUser = (user: LoginResponse['user']) => {
  localStorage.setItem('qatrack_user', JSON.stringify(user));
};

export const getUser = (): LoginResponse['user'] | null => {
  const user = localStorage.getItem('qatrack_user');
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem('qatrack_token');
  localStorage.removeItem('qatrack_user');
};

export const isAuthenticated = () => {
  return !!getToken();
};