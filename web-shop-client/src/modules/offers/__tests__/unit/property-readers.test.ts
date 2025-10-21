import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PropertyReadersService } from '../../infrastructure/services/property-readers.service';
import { HttpClientMock } from '../../../../infrastructure/http/http-client.mock';

describe('PropertyReadersService', () => {
  let service: PropertyReadersService;
  let mockHttpClient: HttpClientMock;

  beforeEach(() => {
    mockHttpClient = new HttpClientMock();
    service = new PropertyReadersService(mockHttpClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should read user.purchases.length property', async () => {
    const mockPurchases = [
      { id: 'purchase-1', amount: 10 },
      { id: 'purchase-2', amount: 20 }
    ];

    // Mock the HTTP response
    (mockHttpClient.get as any).mockResolvedValue({
      data: mockPurchases,
      status: 200,
      statusText: 'OK',
      headers: {}
    });

    const result = await service.readProperty('user.purchases.length');

    expect(result).toBe(2);
  });

  it('should return 0 for non-existent property', async () => {
    (mockHttpClient.get as any).mockResolvedValue({
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {}
    });

    const result = await service.readProperty('user.nonexistent.length');

    expect(result).toBe(0);
  });

  it('should handle HTTP errors gracefully', async () => {
    (mockHttpClient.get as any).mockRejectedValue(new Error('Network error'));

    const result = await service.readProperty('user.purchases.length');

    expect(result).toBe(0);
  });
});

