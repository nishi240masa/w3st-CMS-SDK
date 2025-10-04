import axios, { AxiosInstance } from 'axios';
import { COLLECTION_IDS } from './types';

export interface ClientConfig {
  apiKey: string;
  baseURL?: string;
}

export interface CMSClient {
  content<T>(name: string): ContentAPI<T>;
}

export interface ContentAPI<T> {
  findMany(options?: FindManyOptions): Promise<T[]>;
  create(data: Record<string, any>): Promise<T>;
}

export interface FindManyOptions {
  populate?: string[];
  limit?: number;
  offset?: number;
}

class ContentAPIImpl<T> implements ContentAPI<T> {
  constructor(private client: AxiosInstance, private collectionId: number) {}

  async findMany(options?: FindManyOptions): Promise<T[]> {
    const response = await this.client.get(`/collections/${this.collectionId}/entries`, { params: options });
    return response.data;
  }

  async create(data: Record<string, any>): Promise<T> {
    const response = await this.client.post(`/collections/${this.collectionId}/entries`, { data });
    return response.data;
  }
}

export function createClient(config: ClientConfig): CMSClient {
  const client = axios.create({
    baseURL: config.baseURL || 'http://localhost:8080',
    headers: {
      'X-API-Key': config.apiKey
    }
  });

  return {
    content<T>(name: string): ContentAPI<T> {
      const collectionId = COLLECTION_IDS[name];
      if (!collectionId) {
        throw new Error(`Collection '${name}' not found. Run 'npx @w3st/cli pull' to update types.`);
      }
      return new ContentAPIImpl<T>(client, collectionId);
    }
  };
}