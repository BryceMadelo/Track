import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({ baseURL: 'http://localhost:3000' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface TestSuite {
  id: number;
  name: string;
  description: string;
  type: 'smoke' | 'regression' | 'sanity' | 'release';
  testCases: { id: number; title: string }[];
  createdAt: string;
}

export const getTestSuites = async (): Promise<TestSuite[]> => {
  const { data } = await api.get('/test-suites');
  return data;
};

export const createTestSuite = async (suite: Partial<TestSuite> & { testCaseIds?: number[] }): Promise<TestSuite> => {
  const { data } = await api.post('/test-suites', suite);
  return data;
};