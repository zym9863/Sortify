# [English](./README_EN.md) | [中文](./README.md)
# Sortify - Sorting as a Service

An interactive sorting algorithm visualizer and performance analysis platform based on Fastify backend and Vue frontend.

## Features

### 1. Interactive Sorting Algorithm Visualizer
- Supports multiple sorting algorithms (Bubble Sort, Quick Sort, Merge Sort, Insertion Sort, etc.)
- Real-time animation of the sorting process
- Custom data input or random data generation
- Step-by-step execution and state tracking

### 2. Sorting Performance Analysis API
- RESTful API endpoints
- Multi-algorithm performance comparison
- Detailed performance metrics (execution time, number of comparisons, number of swaps)
- Supports testing with different data sizes and distributions

## Tech Stack

- **Backend**: Fastify + Node.js
- **Frontend**: Vue 3 + Vite
- **Package Manager**: pnpm
- **Dev Tools**: TypeScript, ESLint, Prettier

## Project Structure

```
sortify/
├── backend/          # Fastify backend service
├── frontend/         # Vue frontend app
├── package.json      # Root project config
└── README_EN.md      # Project documentation (English)
```

## Quick Start

### Install dependencies
```bash
pnpm install
```

### Development mode
```bash
pnpm run dev
```

### Build project
```bash
pnpm run build
```

### Start production server
```bash
pnpm start
```

## API Documentation

### Sorting Visualization API
- `POST /api/sort/visualize` - Get sorting step data
- `GET /api/algorithms` - Get supported algorithm list

### Performance Analysis API
- `POST /api/sort/analyze` - Run performance analysis
- `GET /api/sort/benchmark` - Get benchmark results

## License

MIT License
