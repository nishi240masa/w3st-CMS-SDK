import { createClient } from '../src/client';

describe('createClient', () => {
  it('should create a client', () => {
    const client = createClient({
      apiKey: 'test-key'
    });
    expect(client).toBeDefined();
    expect(typeof client.content).toBe('function');
  });

  it('should return content API', () => {
    const client = createClient({
      apiKey: 'test-key'
    });
    const contentAPI = client.content('articles');
    expect(contentAPI).toBeDefined();
    expect(typeof contentAPI.findMany).toBe('function');
    expect(typeof contentAPI.create).toBe('function');
  });
});