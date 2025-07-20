# [English](./README_EN.md) | [中文](./README.md)
# Sortify - 排序即服务

一个基于 Fastify 后端和 Vue 前端的交互式排序算法可视化器和性能分析平台。

## 功能特性

### 1. 交互式排序算法可视化器
- 支持多种排序算法（冒泡排序、快速排序、归并排序、插入排序等）
- 实时动画展示排序过程
- 自定义数据输入或随机数据生成
- 逐步执行和状态追踪

### 2. 排序性能分析 API
- RESTful API 接口
- 多算法性能对比
- 详细的性能指标（执行时间、比较次数、交换次数）
- 支持不同数据规模和分布的测试

## 技术栈

- **后端**: Fastify + Node.js
- **前端**: Vue 3 + Vite
- **包管理器**: pnpm
- **开发工具**: TypeScript, ESLint, Prettier

## 项目结构

```
sortify/
├── backend/          # Fastify 后端服务
├── frontend/         # Vue 前端应用
├── package.json      # 根项目配置
└── README.md         # 项目说明
```

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm run dev
```

### 构建项目
```bash
pnpm run build
```

### 启动生产服务
```bash
pnpm start
```

## API 文档

### 排序可视化 API
- `POST /api/sort/visualize` - 获取排序步骤数据
- `GET /api/algorithms` - 获取支持的算法列表

### 性能分析 API
- `POST /api/sort/analyze` - 执行性能分析
- `GET /api/sort/benchmark` - 获取基准测试结果

## 许可证

MIT License
