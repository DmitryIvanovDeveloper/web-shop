export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

export interface HttpClient {
  request<T>(request: HttpRequest): Promise<HttpResponse<T>>;
  get<T>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>>;
  put<T>(url: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>>;
  delete<T>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>>;
}
