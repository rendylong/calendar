import {ApiResponse} from './types/event';

class ApiClient {
    private static instance: ApiClient;

    private constructor() {
    }

    static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    async get<T>(url: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
        try {
            const queryString = params ? `?${new URLSearchParams(params)}` : '';
            const response = await fetch(`${url}${queryString}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            return data as ApiResponse<T>;
        } catch (error) {
            return {
                success: false,
                data: {} as T,
                error: error instanceof Error ? error.message : '未知错误',
            };
        }
    }

    async post<T, D = Record<string, unknown>>(url: string, data: D): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const responseData = await response.json();
            return responseData as ApiResponse<T>;
        } catch (error) {
            return {
                success: false,
                data: {} as T,
                error: error instanceof Error ? error.message : '未知错误',
            }
        }
    }
}

export const apiClient = ApiClient.getInstance();