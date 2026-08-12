import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = 'http://localhost:3000/objects';

export interface ObjectEntity {
  id: string;
  name: string;
  locatorType: string;
  locatorValue: string;
  description: string;
  createdAt: string;
}

export const getObjects = async (): Promise<ObjectEntity[]> => {
  const response = await axios.get(API_URL, { headers: getAuthHeader() });
  return response.data;
};

export const createObject = async (data: Omit<ObjectEntity, 'id' | 'createdAt'>): Promise<ObjectEntity> => {
  const response = await axios.post(API_URL, data, { headers: getAuthHeader() });
  return response.data;
};

export const updateObject = async (id: string, data: Partial<ObjectEntity>): Promise<ObjectEntity> => {
  const response = await axios.put(`${API_URL}/${id}`, data, { headers: getAuthHeader() });
  return response.data;
};

export const deleteObject = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};
