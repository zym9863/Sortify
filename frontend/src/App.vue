<script setup lang="ts">
import { ref, computed } from 'vue';
import DataInput from './components/DataInput.vue';
import AlgorithmSelector from './components/AlgorithmSelector.vue';
import SortVisualizer from './components/SortVisualizer.vue';
import PerformanceAnalysis from './components/PerformanceAnalysis.vue';
import { SortifyAPI, type SortingAlgorithm, type SortStep, type PerformanceMetrics } from './services/api';
import { ElMessage, ElLoading } from 'element-plus';

// 应用状态
const currentStep = ref<'input' | 'algorithm' | 'visualize' | 'analysis'>('input');
const showAnalysis = ref(false);
const inputData = ref<number[]>([]);
const selectedAlgorithm = ref<SortingAlgorithm | null>(null);
const sortSteps = ref<SortStep[]>([]);
const performanceMetrics = ref<PerformanceMetrics | null>(null);
const loading = ref(false);

// 计算属性
const canProceedToAlgorithm = computed(() => inputData.value.length > 0);
const canProceedToVisualize = computed(() => selectedAlgorithm.value !== null);
const algorithmDisplayName = computed(() => {
  const algorithmNames: Record<SortingAlgorithm, string> = {
    bubble: '冒泡排序',
    quick: '快速排序',
    merge: '归并排序',
    insertion: '插入排序',
    selection: '选择排序',
    heap: '堆排序',
    shell: '希尔排序',
    counting: '计数排序',
    radix: '基数排序',
    bucket: '桶排序'
  };
  return selectedAlgorithm.value ? algorithmNames[selectedAlgorithm.value] : '';
});

// 事件处理
const handleDataConfirmed = (data: number[]) => {
  inputData.value = data;
  currentStep.value = 'algorithm';
};

const handleAlgorithmSelected = (algorithm: SortingAlgorithm) => {
  selectedAlgorithm.value = algorithm;
  executeSort();
};

const executeSort = async () => {
  if (!selectedAlgorithm.value || inputData.value.length === 0) return;

  try {
    loading.value = true;
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在执行排序算法...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    const response = await SortifyAPI.getSortVisualization({
      data: inputData.value,
      algorithm: selectedAlgorithm.value,
      speed: 'medium'
    });

    sortSteps.value = response.steps;

    // 获取性能指标
    const analysisResponse = await SortifyAPI.getPerformanceAnalysis({
      data: inputData.value,
      algorithms: [selectedAlgorithm.value],
      iterations: 1
    });

    performanceMetrics.value = analysisResponse.results[0];

    currentStep.value = 'visualize';
    ElMessage.success('排序算法执行完成！');

    loadingInstance.close();
  } catch (error) {
    console.error('执行排序失败:', error);
    ElMessage.error('执行排序失败，请检查网络连接');
  } finally {
    loading.value = false;
  }
};

const resetToInput = () => {
  currentStep.value = 'input';
  inputData.value = [];
  selectedAlgorithm.value = null;
  sortSteps.value = [];
  performanceMetrics.value = null;
};

const resetToAlgorithm = () => {
  currentStep.value = 'algorithm';
  selectedAlgorithm.value = null;
  sortSteps.value = [];
  performanceMetrics.value = null;
};

const toggleAnalysis = () => {
  showAnalysis.value = !showAnalysis.value;
};
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <el-icon class="title-icon"><Sort /></el-icon>
          Sortify - 排序即服务
        </h1>
        <p class="app-subtitle">交互式排序算法可视化器和性能分析平台</p>
        <div class="header-actions">
          <el-button
            type="primary"
            :icon="showAnalysis ? 'View' : 'DataAnalysis'"
            @click="toggleAnalysis"
          >
            {{ showAnalysis ? '返回可视化' : '性能分析' }}
          </el-button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="container">
        <!-- 性能分析模式 -->
        <div v-if="showAnalysis">
          <PerformanceAnalysis :current-data="inputData" />
        </div>

        <!-- 可视化模式 -->
        <div v-else>
          <!-- 步骤指示器 -->
          <div class="steps-indicator">
            <el-steps :active="currentStep === 'input' ? 0 : currentStep === 'algorithm' ? 1 : 2" align-center>
              <el-step title="输入数据" description="输入或生成要排序的数据" />
              <el-step title="选择算法" description="选择合适的排序算法" />
              <el-step title="可视化" description="观看排序过程动画" />
            </el-steps>
          </div>

        <!-- 数据输入步骤 -->
        <div v-if="currentStep === 'input'" class="step-content">
          <DataInput
            :initial-data="inputData"
            @data-confirmed="handleDataConfirmed"
          />
        </div>

        <!-- 算法选择步骤 -->
        <div v-if="currentStep === 'algorithm'" class="step-content">
          <div class="step-header">
            <h2>选择排序算法</h2>
            <div class="step-actions">
              <el-button @click="resetToInput" :icon="'ArrowLeft'">
                返回数据输入
              </el-button>
            </div>
          </div>

          <div class="data-summary">
            <el-card class="summary-card">
              <div class="summary-content">
                <el-tag type="info" size="large">
                  数据量: {{ inputData.length }}
                </el-tag>
                <el-tag type="info" size="large">
                  范围: {{ Math.min(...inputData) }} - {{ Math.max(...inputData) }}
                </el-tag>
                <div class="data-preview">
                  <span>数据预览: </span>
                  <span class="preview-numbers">
                    {{ inputData.slice(0, 10).join(', ') }}
                    <span v-if="inputData.length > 10">...</span>
                  </span>
                </div>
              </div>
            </el-card>
          </div>

          <AlgorithmSelector
            :data-size="inputData.length"
            @algorithm-selected="handleAlgorithmSelected"
          />
        </div>

        <!-- 可视化步骤 -->
        <div v-if="currentStep === 'visualize'" class="step-content">
          <div class="step-header">
            <h2>{{ algorithmDisplayName }} 可视化</h2>
            <div class="step-actions">
              <el-button @click="resetToAlgorithm" :icon="'ArrowLeft'">
                重新选择算法
              </el-button>
              <el-button @click="resetToInput" :icon="'Refresh'">
                重新开始
              </el-button>
            </div>
          </div>

          <SortVisualizer
            :steps="sortSteps"
            :algorithm-name="algorithmDisplayName"
            :statistics="performanceMetrics || undefined"
            :show-statistics="true"
            :auto-play="true"
          />
        </div>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2024 Sortify. 基于 Fastify + Vue 3 构建的排序算法学习平台</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.app-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.title-icon {
  font-size: 2.5rem;
}

.app-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0 0 15px 0;
  font-weight: 300;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.app-main {
  flex: 1;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.steps-indicator {
  margin-bottom: 40px;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.step-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.step-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.step-actions {
  display: flex;
  gap: 10px;
}

.data-summary {
  margin-bottom: 30px;
}

.summary-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary-content {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.data-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-size: 14px;
}

.preview-numbers {
  font-family: 'Courier New', monospace;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.app-footer {
  background: rgba(0, 0, 0, 0.2);
  color: rgba(255, 255, 255, 0.8);
  padding: 20px 0;
  text-align: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content p {
  margin: 0;
  font-size: 14px;
}

:deep(.el-steps) {
  margin: 0;
}

:deep(.el-step__title) {
  font-size: 16px;
  font-weight: 600;
}

:deep(.el-step__description) {
  font-size: 14px;
}

@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 10px;
  }

  .title-icon {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }

  .step-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .step-actions {
    justify-content: center;
  }

  .summary-content {
    flex-direction: column;
    align-items: stretch;
  }

  .data-preview {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
