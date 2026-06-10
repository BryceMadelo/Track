import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({ baseURL: 'http://localhost:3000' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Schedule {
  id: number;
  name: string;
  platform: 'web' | 'mobile';
  frequency: 'hourly' | 'daily' | 'weekly' | 'custom';
  environment: string;
  url: string;
  username: string;
  isActive: boolean;
  lastRunAt: string;
  nextRunAt: string;
  createdAt: string;
}

export const getSchedules = async (): Promise<Schedule[]> => {
  const { data } = await api.get('/schedules');
  return data;
};

export const createSchedule = async (schedule: {
  name: string;
  platform: string;
  frequency: string;
  environment?: string;
  url?: string;
  username: string;
  password: string;
}): Promise<Schedule> => {
  const { data } = await api.post('/schedules', schedule);
  return data;
};

export const toggleSchedule = async (id: number): Promise<Schedule> => {
  const { data } = await api.patch(`/schedules/${id}/toggle`);
  return data;
};

export const deleteSchedule = async (id: number): Promise<void> => {
  await api.delete(`/schedules/${id}`);
};