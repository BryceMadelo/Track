import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({ baseURL: 'http://localhost:3000' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Bug {
  id: number;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  status: 'open' | 'in_progress' | 'in_review' | 'fixed' | 'closed' | 'wont_fix';
  severity: 'critical' | 'high' | 'medium' | 'low';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  environment: string;
  version: string;
  resolution: string;
  reportedBy: { id: number; username: string; fullName: string };
  assignedTo: { id: number; username: string; fullName: string };
  createdAt: string;
  resolvedAt: string;
}

export interface BugStats {
  total: number;
  open: number;
  inProgress: number;
  fixed: number;
  critical: number;
}

export const getBugs = async (): Promise<Bug[]> => {
  const { data } = await api.get('/bugs');
  return data;
};

export const getBugStats = async (): Promise<BugStats> => {
  const { data } = await api.get('/bugs/stats');
  return data;
};

export const createBug = async (bug: Partial<Bug> & {
  assignedToId?: number;
  reportedById?: number;
}): Promise<Bug> => {
  const { data } = await api.post('/bugs', bug);
  return data;
};

export const updateBugStatus = async (
  id: number,
  status: string,
  resolution?: string,
): Promise<Bug> => {
  const { data } = await api.patch(`/bugs/${id}/status`, { status, resolution });
  return data;
};

export const updateBug = async (id: number, bug: Partial<Bug>): Promise<Bug> => {
  const { data } = await api.put(`/bugs/${id}`, bug);
  return data;
};

export const deleteBug = async (id: number): Promise<void> => {
  await api.delete(`/bugs/${id}`);
};