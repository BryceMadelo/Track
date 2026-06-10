import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({ baseURL: 'http://localhost:3000' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface Execution {
  id: number;
  status: 'queued' | 'running' | 'passed' | 'failed';
  platform: 'web' | 'mobile' | 'api';
  environment: string;
  jobId: string;
  output: string;
  error: string;
  startedAt: string;
  finishedAt: string;
}

export const getExecutions = async (): Promise<Execution[]> => {
  const { data } = await api.get('/executions');
  return data;
};

export const runWebTest = async (params: {
  username: string;
  password: string;
  url: string;
  environment?: string;
}) => {
  const { data } = await api.post('/executions/web', params);
  return data;
};

export const runMobileTest = async (params: {
  username: string;
  password: string;
}) => {
  const { data } = await api.post('/executions/mobile', params);
  return data;
};

export const runVisualWebTest = async (params: {
  username: string;
  password: string;
  url: string;
  environment?: string;
  engine: 'playwright' | 'selenium';
  featureTitle: string;
  scenarioTitle: string;
  steps: {
    keyword: string;
    title: string;
    description: string;
    captureScreenshot: boolean;
  }[];
}) => {
  const { data } = await api.post('/executions/web/visual', params);
  return data;
};