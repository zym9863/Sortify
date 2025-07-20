import axios from 'axios';

// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 支持跨域认证
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('响应错误:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// 类型定义
export type SortingAlgorithm = 
  | 'bubble'
  | 'quick'
  | 'merge'
  | 'insertion'
  | 'selection'
  | 'heap'
  | 'shell'
  | 'counting'
  | 'radix'
  | 'bucket';

export interface SortStep {
  array: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  pivot?: number;
  step: number;
  description: string;
}

export interface SortVisualizeRequest {
  data: number[];
  algorithm: SortingAlgorithm;
  speed?: 'slow' | 'medium' | 'fast';
}

export interface SortVisualizeResponse {
  steps: SortStep[];
  totalSteps: number;
  algorithm: SortingAlgorithm;
  originalData: number[];
  sortedData: number[];
}

export interface PerformanceAnalysisRequest {
  data: number[];
  algorithms: SortingAlgorithm[];
  iterations?: number;
}

export interface PerformanceMetrics {
  algorithm: SortingAlgorithm;
  executionTime: number;
  comparisons: number;
  swaps: number;
  stability: boolean;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
}

export interface PerformanceAnalysisResponse {
  dataSize: number;
  results: PerformanceMetrics[];
  timestamp: string;
  iterations: number;
}

export interface AlgorithmInfo {
  name: SortingAlgorithm;
  displayName: string;
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  stability: boolean;
  inPlace: boolean;
  adaptive: boolean;
}

// API 服务类
export class SortifyAPI {
  // 获取排序可视化数据
  static async getSortVisualization(request: SortVisualizeRequest): Promise<SortVisualizeResponse> {
    const response = await api.post<SortVisualizeResponse>('/sort/visualize', request);
    return response.data;
  }

  // 获取性能分析数据
  static async getPerformanceAnalysis(request: PerformanceAnalysisRequest): Promise<PerformanceAnalysisResponse> {
    const response = await api.post<PerformanceAnalysisResponse>('/sort/analyze', request);
    return response.data;
  }

  // 生成测试数据
  static async generateData(params: {
    size?: number;
    min?: number;
    max?: number;
    type?: 'random' | 'sorted' | 'reverse' | 'nearly_sorted';
  }): Promise<{ data: number[] }> {
    const response = await api.get<{ data: number[] }>('/sort/generate-data', { params });
    return response.data;
  }

  // 获取所有算法信息
  static async getAllAlgorithms(): Promise<AlgorithmInfo[]> {
    const response = await api.get<AlgorithmInfo[]>('/algorithms');
    return response.data;
  }

  // 获取特定算法信息
  static async getAlgorithmInfo(name: SortingAlgorithm): Promise<AlgorithmInfo> {
    const response = await api.get<AlgorithmInfo>(`/algorithms/${name}`);
    return response.data;
  }

  // 获取算法推荐
  static async getAlgorithmRecommendations(params: {
    dataSize?: number;
    isNearlySorted?: boolean;
  }): Promise<AlgorithmInfo[]> {
    const response = await api.get<AlgorithmInfo[]>('/algorithms/recommend', { params });
    return response.data;
  }

  // 根据特性筛选算法
  static async filterAlgorithms(params: {
    stable?: boolean;
    inPlace?: boolean;
    adaptive?: boolean;
  }): Promise<AlgorithmInfo[]> {
    const response = await api.get<AlgorithmInfo[]>('/algorithms/filter', { params });
    return response.data;
  }

  // 获取算法复杂度分类
  static async getAlgorithmsByComplexity(): Promise<{ [key: string]: AlgorithmInfo[] }> {
    const response = await api.get<{ [key: string]: AlgorithmInfo[] }>('/algorithms/complexity');
    return response.data;
  }
}

export default api;
