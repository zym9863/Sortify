// 排序算法类型
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

// 排序步骤接口
export interface SortStep {
  array: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  pivot?: number;
  step: number;
  description: string;
}

// 排序可视化请求
export interface SortVisualizeRequest {
  data: number[];
  algorithm: SortingAlgorithm;
  speed?: 'slow' | 'medium' | 'fast';
}

// 排序可视化响应
export interface SortVisualizeResponse {
  steps: SortStep[];
  totalSteps: number;
  algorithm: SortingAlgorithm;
  originalData: number[];
  sortedData: number[];
}

// 性能分析请求
export interface PerformanceAnalysisRequest {
  data: number[];
  algorithms: SortingAlgorithm[];
  iterations?: number;
}

// 性能指标
export interface PerformanceMetrics {
  algorithm: SortingAlgorithm;
  executionTime: number; // 毫秒
  comparisons: number;
  swaps: number;
  memoryUsage?: number;
  stability: boolean;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
}

// 性能分析响应
export interface PerformanceAnalysisResponse {
  dataSize: number;
  results: PerformanceMetrics[];
  timestamp: string;
  iterations: number;
}

// 算法信息
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

// 错误响应
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// 基准测试结果
export interface BenchmarkResult {
  dataSize: number;
  algorithms: {
    [key in SortingAlgorithm]?: {
      averageTime: number;
      minTime: number;
      maxTime: number;
      standardDeviation: number;
    };
  };
}
