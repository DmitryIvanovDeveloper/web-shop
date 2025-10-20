import { describe, it, expect } from 'vitest';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';

describe('Offers API E2E Tests', () => {
  let httpClient: HttpClientMock;

  beforeEach(() => {
    httpClient = new HttpClientMock();
  });

  it('should load rules from API', async () => {
    const response = await httpClient.get('/api/offers/rules');
    
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.operationType).toBe('condition');
  });

  it('should load user purchases from API', async () => {
    const response = await httpClient.get('/api/user/purchases');
    
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('should load specific offer from API', async () => {
    const response = await httpClient.get('/api/products/offers/tank-turret');
    
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe('tank-turret');
  });

  it('should return 404 for non-existent offer', async () => {
    const response = await httpClient.get('/api/products/offers/non-existent');
    
    expect(response.status).toBe(404);
  });
});
