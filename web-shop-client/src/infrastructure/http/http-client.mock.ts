import { injectable } from 'inversify';
import { HttpClient, HttpRequest, HttpResponse } from '../../application/ports/http-client.port';


@injectable()
export class HttpClientMock implements HttpClient {
  private readonly manualResponses: Map<string, { data: any; status: number; statusText: string }> =
    new Map();

  constructor(private readonly publicBasePath: string = '/mocks') {}

  public setMockResponse(url: string, data: any, status = 200, statusText = 'OK'): void {
    this.manualResponses.set(url, { data, status, statusText });
  }

  async request<T>(request: HttpRequest): Promise<HttpResponse<T>> {
    const manualResponse =
      this.manualResponses.get(request.url) ??
      (request.url.includes('?')
        ? this.manualResponses.get(request.url.split('?')[0]!)
        : undefined);

    if (manualResponse) {
      return {
        data: manualResponse.data as T,
        status: manualResponse.status,
        statusText: manualResponse.statusText,
        headers: {},
      };
    }

    const mockPath = this.mapToMockPath(request.url);
                if (typeof window === 'undefined') {
      try {
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
        const [pathOnly] = apiUrl.split('?');
        const normalized = pathOnly.replace(/\/$/, '');
        return `${this.publicBasePath}${normalized}.json`;
  }
}


