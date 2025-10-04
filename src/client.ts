import axios, { AxiosInstance } from 'axios';

export interface ClientConfig {
  apiKey: string;
  baseURL?: string;
}

export interface CMSClient {
  content<T>(name: string): ContentAPI<T>;
}

interface Collection {
  id: number;
  name: string;
  api_name: string;
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
  private collectionId: number | null = null;

  constructor(private client: AxiosInstance, private collectionName: string) {}

  private async getCollectionId(): Promise<number> {
    if (this.collectionId !== null) {
      return this.collectionId;
    }

    const response = await this.client.get('/collections');
    const collections: Collection[] = response.data;

    const collection = collections.find(c => c.api_name === this.collectionName);
    if (!collection) {
      throw new Error(`Collection with API name '${this.collectionName}' not found`);
    }

    this.collectionId = collection.id;
    return this.collectionId;
  }

  async findMany(options?: FindManyOptions): Promise<T[]> {
    const collectionId = await this.getCollectionId();
    const response = await this.client.get(`/collections/${collectionId}/entries`, { params: options });
    return response.data;
  }

  async create(data: Record<string, any>): Promise<T> {
    const collectionId = await this.getCollectionId();
    const response = await this.client.post(`/collections/${collectionId}/entries`, { data });
    return response.data;
  }
}

export function createClient(config: ClientConfig): CMSClient {
  const client = axios.create({
    baseURL: config.baseURL || 'https://api.w3st.io',
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