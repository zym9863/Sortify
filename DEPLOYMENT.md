# 部署文档

## 架构概述

Sortify 采用前后端分离架构：

- **前端**: Vue.js + TypeScript，部署在 Cloudflare Pages (https://sortify.pages.dev/)
- **后端**: Fastify + TypeScript，部署在 Render (https://sortify-9sj9.onrender.com/)

## 环境配置

### 后端环境变量

在 Render 中设置以下环境变量：

```
NODE_ENV=production
PORT=10000
ALLOWED_ORIGINS=https://sortify.pages.dev
```

### 前端环境变量

在 Cloudflare Pages 中设置：

```
VITE_API_BASE_URL=https://sortify-9sj9.onrender.com/api
```

## CORS 配置

后端已配置 CORS 支持：

- **生产环境**: 仅允许 `https://sortify.pages.dev` 域名
- **开发环境**: 允许所有来源 (localhost)
- **支持的方法**: GET, POST, PUT, DELETE, OPTIONS
- **允许的头部**: Content-Type, Authorization, X-Requested-With
- **凭据支持**: 启用

## 部署流程

### 后端部署 (Render)

1. 连接 GitHub 仓库
2. 设置构建命令: `pnpm install && pnpm build`
3. 设置启动命令: `pnpm start`
4. 配置环境变量
5. 部署

### 前端部署 (Cloudflare Pages)

1. 连接 GitHub 仓库
2. 设置构建命令: `pnpm build`
3. 设置输出目录: `dist`
4. 配置环境变量
5. 部署

## 本地开发

### 启动后端

```bash
cd backend
pnpm install
pnpm dev
```

### 启动前端

```bash
cd frontend
pnpm install
pnpm dev
```

## 监控和日志

- **后端健康检查**: `/health` 端点
- **API 文档**: `/docs` 端点
- **日志级别**: 生产环境为 info，开发环境为 debug

## 安全特性

- CORS 配置
- Helmet 安全头
- 速率限制 (100 请求/分钟)
- 环境变量保护敏感信息
