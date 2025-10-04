import axios, { AxiosInstance } from 'axios';

export interface ClientConfig {
  apiKey: string;
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
  constructor(private client: AxiosInstance, private collectionName: string) {}

  async findMany(options?: FindManyOptions): Promise<T[]> {
    const response = await this.client.get(`/content/${this.collectionName}`, { params: options });
    return response.data;
  }

  async create(data: Record<string, any>): Promise<T> {
    const response = await this.client.post(`/content/${this.collectionName}`, data);
    return response.data;
  }
}

export function createClient(config: ClientConfig): CMSClient {
  const client = axios.create({
    baseURL: 'https://api.w3st.io',
    headers: {
      'X-API-Key': config.apiKey
    }
  });

  return {
    content<T>(name: string): ContentAPI<T> {
      return new ContentAPIImpl<T>(client, name);
    }
  };
}