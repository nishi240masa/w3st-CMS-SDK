import { createClient } from '../src/client';
import * as types from '../src/types';

describe('createClient', () => {
  const originalCollectionIds = types.COLLECTION_IDS;

  afterEach(() => {
    (types as any).COLLECTION_IDS = originalCollectionIds;
  });

  it('should create a client', () => {
    const client = createClient({
      baseURL: 'https://api.example.com',
      apiKey: 'test-key'
    });
    expect(client).toBeDefined();
    expect(typeof client.content).toBe('function');
  });

  it('should return content API', () => {
    const client = createClient({
      baseURL: 'https://api.example.com',
      apiKey: 'test-key'
    });
    // Mock COLLECTION_IDS
    (types as any).COLLECTION_IDS = { articles: 1 };
    const contentAPI = client.content('articles');
    expect(contentAPI).toBeDefined();
    expect(typeof contentAPI.findMany).toBe('function');
    expect(typeof contentAPI.create).toBe('function');
  });

  it('should throw error for unknown collection', () => {
    const client = createClient({
      baseURL: 'https://api.example.com',
      apiKey: 'test-key'
    });
    (types as any).COLLECTION_IDS = {};
    expect(() => client.content('unknown')).toThrow();
  });
});