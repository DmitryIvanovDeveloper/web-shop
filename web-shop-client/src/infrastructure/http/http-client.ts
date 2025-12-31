import { injectable } from 'inversify';
import { HttpClient, HttpRequest, HttpResponse } from '../../application/ports/http-client.port';

@injectable()
export class AxiosHttpClient implements HttpClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  async request<T>(request: HttpRequest): Promise<HttpResponse<T>> {
    try {
      const url = `${this.baseURL}${request.url}`;
      console.log('[AxiosHttpClient] Making request to:', url);
      console.log('[AxiosHttpClient] Request method:', request.method);
      console.log('[AxiosHttpClient] Request body:', request.body);

      // Simulate HTTP request
      const response = await fetch(url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        },
        body: request.body ? JSON.stringify(request.body) : undefined
      });

      console.log('[AxiosHttpClient] Fetch response status:', response.status);
      console.log('[AxiosHttpClient] Fetch response ok:', response.ok);

      const data = await response.json();
      console.log('[AxiosHttpClient] Parsed JSON data:', data);

      const result = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.extractHeaders(response)
      };

      console.log('[AxiosHttpClient] Final response object:', result);
      return result;
    } catch (error) {
      console.error('[AxiosHttpClient] Request failed:', error);
      throw new Error(`HTTP request failed: ${error}`);
    }
  }

  async get<T>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    console.log('[AxiosHttpClient] GET request to:', url);
    const response = await this.request<T>({ url, method: 'GET', headers });
    console.log('[AxiosHttpClient] GET response:', response);
    return response;
  }

  async post<T>(url: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    console.log('[AxiosHttpClient] POST request to:', url, 'with body:', body);
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
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }
}
