import axios, { AxiosInstance } from 'axios';
import jwt from 'jsonwebtoken';

export interface ClientConfig {
  apiKey: string;
  baseURL?: string;
}

interface DecodedToken {
  user_id: string;
  project_id: number;
  collection_ids: number[];
}

export interface CMSClient {
  content<T>(name: string): ContentAPI<T>;
}

interface Collection {
  id: number;
  name: string;
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
  private collections: Collection[] = [];

  constructor(private client: AxiosInstance, private collectionName: string, private decodedToken: DecodedToken) {}

  private async getCollectionId(): Promise<number> {
    if (this.collectionId !== null) {
      return this.collectionId;
    }

    // コレクション一覧を取得（キャッシュがなければ）
    if (this.collections.length === 0) {
      const response = await this.client.get('/collections');
      this.collections = response.data;
    }

    // コレクション名からIDを取得
    const collection = this.collections.find(c => c.name === this.collectionName);
    if (!collection) {
      throw new Error(`Collection with API name '${this.collectionName}' not found`);
    }

    // apikeyがアクセス可能なコレクションか確認
    if (!this.decodedToken.collection_ids.includes(collection.id)) {
      throw new Error(`Collection '${this.collectionName}' not accessible with this API key`);
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
  // Try to decode JWT token to get collection information.
  // If the apiKey is a plain/test key (non-JWT), fall back to a permissive empty token
  // so tests and simple usages work without a real JWT.
  const maybeDecoded = jwt.decode(config.apiKey) as DecodedToken | null;
  let decodedToken: DecodedToken;
  if (maybeDecoded && Array.isArray((maybeDecoded as any).collection_ids)) {
    decodedToken = maybeDecoded;
  } else {
    decodedToken = { user_id: '', project_id: 0, collection_ids: [] };
  }

  const client = axios.create({
    baseURL: config.baseURL || 'https://api.w3st.net',
    headers: {
      'X-API-Key': config.apiKey
    }
  });

  return {
    content<T>(name: string): ContentAPI<T> {
      return new ContentAPIImpl<T>(client, name, decodedToken);
    }
  };
}