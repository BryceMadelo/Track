import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({ baseURL: 'http://localhost:3000' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface TestStep {
  order: number;
  action: string;
  expected: string;
}

export interface TestCase {
  id: number;
  title: string;
  description: string;
  platform: 'web' | 'mobile' | 'api';
  priority: 'high' | 'medium' | 'low';
  automationStatus: 'automated' | 'manual' | 'in_progress';
  tags: string;
  steps: TestStep[];
  expectedResult: string;
  createdAt: string;
}

export const getTestCases = async (): Promise<TestCase[]> => {
  const { data } = await api.get('/test-cases');
  return data;
};

export const createTestCase = async (testCase: Partial<TestCase>): Promise<TestCase> => {
  const { data } = await api.post('/test-cases', testCase);
  return data;
};

export const updateTestCase = async (id: number, testCase: Partial<TestCase>): Promise<TestCase> => {
  const { data } = await api.put(`/test-cases/${id}`, testCase);
  return data;
};

export const deleteTestCase = async (id: number): Promise<void> => {
  await api.delete(`/test-cases/${id}`);
};