import { FastifyPluginAsync } from 'fastify';
import { AlgorithmService } from '../services/algorithmService.js';
import { AlgorithmInfo, ErrorResponse } from '../types/index.js';

const algorithmRoutes: FastifyPluginAsync = async (fastify) => {
  const algorithmService = new AlgorithmService();

  // 获取所有算法信息
  fastify.get<{
    Reply: AlgorithmInfo[] | ErrorResponse;
  }>('/', {
    schema: {
      description: '获取所有支持的排序算法信息',
      tags: ['algorithms'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              displayName: { type: 'string' },
              description: { type: 'string' },
              timeComplexity: {
                type: 'object',
                properties: {
                  best: { type: 'string' },
                  average: { type: 'string' },
                  worst: { type: 'string' }
                }
              },
              spaceComplexity: { type: 'string' },
              stability: { type: 'boolean' },
              inPlace: { type: 'boolean' },
              adaptive: { type: 'boolean' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const algorithms = algorithmService.getAllAlgorithms();
      return reply.send(algorithms);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: '获取算法信息时发生错误',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  });

  // 根据名称获取特定算法信息
  fastify.get<{
    Params: { name: string };
    Reply: AlgorithmInfo | ErrorResponse;
  }>('/:name', {
    schema: {
      description: '根据名称获取特定算法信息',
      tags: ['algorithms'],
      params: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            enum: ['bubble', 'quick', 'merge', 'insertion', 'selection', 'heap', 'shell', 'counting', 'radix', 'bucket']
          }
        },
        required: ['name']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            displayName: { type: 'string' },
            description: { type: 'string' },
            timeComplexity: {
              type: 'object',
              properties: {
                best: { type: 'string' },
                average: { type: 'string' },
                worst: { type: 'string' }
              }
            },
            spaceComplexity: { type: 'string' },
            stability: { type: 'boolean' },
            inPlace: { type: 'boolean' },
            adaptive: { type: 'boolean' }
          }
        },
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            statusCode: { type: 'number' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { name } = request.params;
      const algorithm = algorithmService.getAlgorithmByName(name as any);
      
      if (!algorithm) {
        return reply.code(404).send({
          error: 'Algorithm Not Found',
          message: `算法 '${name}' 不存在`,
          statusCode: 404,
          timestamp: new Date().toISOString()
        });
      }

      return reply.send(algorithm);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: '获取算法信息时发生错误',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  });

  // 获取算法推荐
  fastify.get<{
    Querystring: {
      dataSize?: number;
      isNearlySorted?: boolean;
    };
    Reply: AlgorithmInfo[] | ErrorResponse;
  }>('/recommend', {
    schema: {
      description: '根据数据特征推荐合适的排序算法',
      tags: ['algorithms'],
      querystring: {
        type: 'object',
        properties: {
          dataSize: {
            type: 'number',
            minimum: 1,
            description: '数据大小'
          },
          isNearlySorted: {
            type: 'boolean',
            description: '数据是否接近有序'
          }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              displayName: { type: 'string' },
              description: { type: 'string' },
              timeComplexity: {
                type: 'object',
                properties: {
                  best: { type: 'string' },
                  average: { type: 'string' },
                  worst: { type: 'string' }
                }
              },
              spaceComplexity: { type: 'string' },
              stability: { type: 'boolean' },
              inPlace: { type: 'boolean' },
              adaptive: { type: 'boolean' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { dataSize = 100, isNearlySorted = false } = request.query;
      const recommendations = algorithmService.recommendAlgorithm(dataSize, isNearlySorted);
      return reply.send(recommendations);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: '获取算法推荐时发生错误',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  });

  // 根据特性筛选算法
  fastify.get<{
    Querystring: {
      stable?: boolean;
      inPlace?: boolean;
      adaptive?: boolean;
    };
    Reply: AlgorithmInfo[] | ErrorResponse;
  }>('/filter', {
    schema: {
      description: '根据算法特性筛选算法',
      tags: ['algorithms'],
      querystring: {
        type: 'object',
        properties: {
          stable: {
            type: 'boolean',
            description: '是否为稳定排序'
          },
          inPlace: {
            type: 'boolean',
            description: '是否为原地排序'
          },
          adaptive: {
            type: 'boolean',
            description: '是否为自适应排序'
          }
        }
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              displayName: { type: 'string' },
              description: { type: 'string' },
              timeComplexity: {
                type: 'object',
                properties: {
                  best: { type: 'string' },
                  average: { type: 'string' },
                  worst: { type: 'string' }
                }
              },
              spaceComplexity: { type: 'string' },
              stability: { type: 'boolean' },
              inPlace: { type: 'boolean' },
              adaptive: { type: 'boolean' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { stable, inPlace, adaptive } = request.query;
      let algorithms = algorithmService.getAllAlgorithms();

      // 根据查询参数筛选
      if (stable !== undefined) {
        algorithms = algorithms.filter(algo => algo.stability === stable);
      }
      if (inPlace !== undefined) {
        algorithms = algorithms.filter(algo => algo.inPlace === inPlace);
      }
      if (adaptive !== undefined) {
        algorithms = algorithms.filter(algo => algo.adaptive === adaptive);
      }

      return reply.send(algorithms);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: '筛选算法时发生错误',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  });

  // 获取算法复杂度分类
  fastify.get<{
    Reply: { [key: string]: AlgorithmInfo[] } | ErrorResponse;
  }>('/complexity', {
    schema: {
      description: '根据时间复杂度对算法进行分类',
      tags: ['algorithms'],
      response: {
        200: {
          type: 'object',
          additionalProperties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                displayName: { type: 'string' },
                description: { type: 'string' },
                timeComplexity: {
                  type: 'object',
                  properties: {
                    best: { type: 'string' },
                    average: { type: 'string' },
                    worst: { type: 'string' }
                  }
                },
                spaceComplexity: { type: 'string' },
                stability: { type: 'boolean' },
                inPlace: { type: 'boolean' },
                adaptive: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const complexityCategories = algorithmService.getAlgorithmsByTimeComplexity();
      return reply.send(complexityCategories);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: '获取复杂度分类时发生错误',
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  });
};

export default algorithmRoutes;
