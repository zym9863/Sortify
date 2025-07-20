import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

// 导入路由
import sortRoutes from './routes/sort.js';
import algorithmRoutes from './routes/algorithms.js';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// 注册插件
async function registerPlugins() {
  // CORS 支持
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] 
      : true,
    credentials: true,
  });

  // 安全头
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  // 速率限制
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Swagger 文档
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Sortify API',
        description: '排序即服务 API 文档',
        version: '1.0.0',
      },
      host: 'localhost:3000',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'sorting', description: '排序相关接口' },
        { name: 'algorithms', description: '算法相关接口' },
      ],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  });
}

// 注册路由
async function registerRoutes() {
  await fastify.register(sortRoutes, { prefix: '/api/sort' });
  await fastify.register(algorithmRoutes, { prefix: '/api/algorithms' });
}

// 健康检查端点
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// 启动服务器
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    
    console.log(`🚀 Sortify 后端服务已启动`);
    console.log(`📍 服务地址: http://localhost:${port}`);
    console.log(`📚 API 文档: http://localhost:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n正在关闭服务器...');
  await fastify.close();
  process.exit(0);
});

start();
