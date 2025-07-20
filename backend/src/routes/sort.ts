import { FastifyPluginAsync } from 'fastify';
import { SortingService } from '../services/sortingService.js';
import { 
  SortVisualizeRequest, 
  SortVisualizeResponse, 
  PerformanceAnalysisRequest, 
  PerformanceAnalysisResponse,
  ErrorResponse 
} from '../types/index.js';

const sortRoutes: FastifyPluginAsync = async (fastify) => {
  const sortingService = new SortingService();

  // 排序可视化端点
  fastify.post<{
    Body: SortVisualizeRequest;
    Reply: SortVisualizeResponse | ErrorResponse;
  }>('/visualize', {
    schema: {
      description: '获取排序算法的可视化步骤',
      tags: ['sorting'],
      body: {
        type: 'object',
        required: ['data', 'algorithm'],
        properties: {
          data: {
            type: 'array',
            items: { type: 'number' },
            minItems: 1,
            maxItems: 100,
            description: '要排序的数据数组'
          },
          algorithm: {
            type: 'string',
            enum: ['bubble', 'quick', 'merge', 'insertion', 'selection', 'heap'],
            description: '排序算法类型'
          },
          speed: {
            type: 'string',
            enum: ['slow', 'medium', 'fast'],
            description: '动画速度'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  array: { type: 'array', items: { type: 'number' } },
                  comparing: { type: 'array', items: { type: 'number' } },
                  swapping: { type: 'array', items: { type: 'number' } },
                  sorted: { type: 'array', items: { type: 'number' } },
                  pivot: { type: 'number' },
                  step: { type: 'number' },
                  description: { type: 'string' }
                }
              }
            },
            totalSteps: { type: 'number' },
            algorithm: { type: 'string' },
            originalData: { type: 'array', items: { type: 'number' } },
            sortedData: { type: 'array', items: { type: 'number' } }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { data, algorithm, speed = 'medium' } = request.body;

      // 验证数据
      if (!Array.isArray(data) || data.length === 0) {
        return reply.code(400).send({
          error: 'Invalid Data',
          message: '数据必须是非空数组',
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
      }

      if (data.length > 100) {
        return reply.code(400).send({
          error: 'Data Too Large',
          message: '数据长度不能超过100个元素',
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
      }

      // 执行排序
      const result = await sortingService.executeSort(algorithm, data);
      const sortedData = [...data].sort((a, b) => a - b);

      const response: SortVisualizeResponse = {
        steps: result.steps,
        totalSteps: result.steps.length,
        algorithm,
        originalData: data,
        sortedData
      };

      return reply.send(response);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : '排序过程中发生错误',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  });

  // 性能分析端点
  fastify.post<{
    Body: PerformanceAnalysisRequest;
    Reply: PerformanceAnalysisResponse | ErrorResponse;
  }>('/analyze', {
    schema: {
      description: '分析排序算法的性能',
      tags: ['sorting'],
      body: {
        type: 'object',
        required: ['data', 'algorithms'],
        properties: {
          data: {
            type: 'array',
            items: { type: 'number' },
            minItems: 1,
            maxItems: 10000,
            description: '要分析的数据数组'
          },
          algorithms: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['bubble', 'quick', 'merge', 'insertion', 'selection', 'heap']
            },
            minItems: 1,
            description: '要分析的算法列表'
          },
          iterations: {
            type: 'number',
            minimum: 1,
            maximum: 10,
            description: '测试迭代次数'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            dataSize: { type: 'number' },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  algorithm: { type: 'string' },
                  executionTime: { type: 'number' },
                  comparisons: { type: 'number' },
                  swaps: { type: 'number' },
                  stability: { type: 'boolean' },
                  timeComplexity: {
                    type: 'object',
                    properties: {
                      best: { type: 'string' },
                      average: { type: 'string' },
                      worst: { type: 'string' }
                    }
                  },
                  spaceComplexity: { type: 'string' }
                }
              }
            },
            timestamp: { type: 'string' },
            iterations: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { data, algorithms, iterations = 1 } = request.body;

      // 验证数据
      if (!Array.isArray(data) || data.length === 0) {
        return reply.code(400).send({
          error: 'Invalid Data',
          message: '数据必须是非空数组',
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
      }

      if (data.length > 10000) {
        return reply.code(400).send({
          error: 'Data Too Large',
          message: '数据长度不能超过10000个元素',
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
      }

      const results = [];

      // 对每个算法进行性能分析
      for (const algorithm of algorithms) {
        const metrics = [];
        
        // 多次迭代取平均值
        for (let i = 0; i < iterations; i++) {
          const result = await sortingService.executeSort(algorithm, [...data]);
          metrics.push(result.metrics);
        }

        // 计算平均性能指标
        const avgMetrics = {
          algorithm,
          executionTime: metrics.reduce((sum, m) => sum + m.executionTime, 0) / iterations,
          comparisons: Math.round(metrics.reduce((sum, m) => sum + m.comparisons, 0) / iterations),
          swaps: Math.round(metrics.reduce((sum, m) => sum + m.swaps, 0) / iterations),
          stability: metrics[0].stability,
          timeComplexity: metrics[0].timeComplexity,
          spaceComplexity: metrics[0].spaceComplexity
        };

        results.push(avgMetrics);
      }

      const response: PerformanceAnalysisResponse = {
        dataSize: data.length,
        results,
        timestamp: new Date().toISOString(),
        iterations
      };

      return reply.send(response);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : '性能分析过程中发生错误',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  });

  // 生成随机数据端点
  fastify.get<{
    Querystring: {
      size?: number;
      min?: number;
      max?: number;
      type?: 'random' | 'sorted' | 'reverse' | 'nearly_sorted';
    };
    Reply: { data: number[] } | ErrorResponse;
  }>('/generate-data', {
    schema: {
      description: '生成测试数据',
      tags: ['sorting'],
      querystring: {
        type: 'object',
        properties: {
          size: {
            type: 'number',
            minimum: 1,
            maximum: 1000,
            description: '数据大小'
          },
          min: {
            type: 'number',
            description: '最小值'
          },
          max: {
            type: 'number',
            description: '最大值'
          },
          type: {
            type: 'string',
            enum: ['random', 'sorted', 'reverse', 'nearly_sorted'],
            description: '数据类型'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { type: 'number' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { 
        size = 20, 
        min = 1, 
        max = 100, 
        type = 'random' 
      } = request.query;

      if (min >= max) {
        return reply.code(400).send({
          error: 'Invalid Range',
          message: '最小值必须小于最大值',
          statusCode: 400,
          timestamp: new Date().toISOString()
        });
      }

      let data: number[] = [];

      switch (type) {
        case 'random':
          data = Array.from({ length: size }, () => 
            Math.floor(Math.random() * (max - min + 1)) + min
          );
          break;
        
        case 'sorted':
          data = Array.from({ length: size }, (_, i) => 
            Math.floor((i / (size - 1)) * (max - min)) + min
          );
          break;
        
        case 'reverse':
          data = Array.from({ length: size }, (_, i) => 
            Math.floor(((size - 1 - i) / (size - 1)) * (max - min)) + min
          );
          break;
        
        case 'nearly_sorted':
          data = Array.from({ length: size }, (_, i) => 
            Math.floor((i / (size - 1)) * (max - min)) + min
          );
          // 随机交换几个元素
          const swapCount = Math.max(1, Math.floor(size * 0.1));
          for (let i = 0; i < swapCount; i++) {
            const idx1 = Math.floor(Math.random() * size);
            const idx2 = Math.floor(Math.random() * size);
            [data[idx1], data[idx2]] = [data[idx2], data[idx1]];
          }
          break;
      }

      return reply.send({ data });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: '生成数据时发生错误',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  });
};

export default sortRoutes;
