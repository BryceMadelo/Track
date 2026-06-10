import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({ baseURL: 'http://localhost:3000' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Environment {
  id: number;
  name: string;
  description: string;
  webUrl: string;
  apiUrl: string;
}

export const getEnvironments = async (): Promise<Environment[]> => {
  const { data } = await api.get('/environments');
  return data;
};

export const createEnvironment = async (env: Partial<Environment>): Promise<Environment> => {
  const { data } = await api.post('/environments', env);
  return data;
};

export const deleteEnvironment = async (id: number): Promise<void> => {
  await api.delete(`/environments/${id}`);
};