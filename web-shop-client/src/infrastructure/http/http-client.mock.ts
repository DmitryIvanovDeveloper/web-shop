import { injectable } from 'inversify';
import { HttpClient, HttpRequest, HttpResponse } from '../../application/ports/http-client.port';

/**
 * HttpClientMock
 * Загружает JSON из публичной папки, зеркалируя структуру путей /api
 * Пример: GET /api/metrics          -> /mocks/api/metrics.json
 *         GET /api/metrics?id=123   -> /mocks/api/metrics.json (query игнорируется)
 *         GET /api/metrics/abc      -> /mocks/api/metrics/abc.json
 */
@injectable()
export class HttpClientMock implements HttpClient {
  constructor(private readonly publicBasePath: string = '/mocks') {}

  async request<T>(request: HttpRequest): Promise<HttpResponse<T>> {
    const mockPath = this.mapToMockPath(request.url);
    
    // В Node.js окружении (тесты) читаем файл напрямую через динамический импорт
    if (typeof window === 'undefined') {
      try {
        // Динамический импорт fs только в Node.js окружении
        const fs = require('fs');
        const path = require('path');
        
        const filePath = path.join(process.cwd(), 'public', mockPath);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent) as T;
        return {
          data,
          status: 200,
          statusText: 'OK',
          headers: {},
        };
      } catch (error) {
        return {
          data: ({} as unknown) as T,
          status: 404,
          statusText: 'Not Found',
          headers: {},
        };
      }
    }
    
    // В браузере используем fetch с полным URL
    const fullUrl = window.location.origin + mockPath;
    const res = await fetch(fullUrl, { cache: 'no-store' });
    if (!res.ok) {
      return {
        data: ({} as unknown) as T,
        status: res.status,
        statusText: res.statusText,
        headers: this.extractHeaders(res),
      };
    }
    const data = (await res.json()) as T;
    return {
      data,
      status: res.status,
      statusText: res.statusText,
      headers: this.extractHeaders(res),
    };
  }

  async get<T>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ url, method: 'GET', headers });
  }
  async post<T>(url: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ url, method: 'POST', body, headers });
  }
  async put<T>(url: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ url, method: 'PUT', body, headers });
  }
  async delete<T>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ url, method: 'DELETE', headers });
  }

  private extractHeaders(response: Response): Record<string, string> {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => (headers[key] = value));
    return headers;
  }

  private mapToMockPath(apiUrl: string): string {
    // Обрезаем querystring
    const [pathOnly] = apiUrl.split('?');
    // Если путь оканчивается на /, убираем
    const normalized = pathOnly.replace(/\/$/, '');
    // Пример: /api/metrics/abc -> /mocks/api/metrics/abc.json
    return `${this.publicBasePath}${normalized}.json`;
  }
}


