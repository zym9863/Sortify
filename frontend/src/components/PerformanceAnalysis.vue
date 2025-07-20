<template>
  <div class="performance-analysis">
    <el-card class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>性能分析</span>
          <el-button 
            type="primary" 
            @click="showAnalysisDialog"
            :icon="'DataAnalysis'"
          >
            开始分析
          </el-button>
        </div>
      </template>
      
      <div v-if="analysisResults.length === 0" class="empty-state">
        <el-empty description="暂无性能分析数据">
          <el-button type="primary" @click="showAnalysisDialog">
            开始性能分析
          </el-button>
        </el-empty>
      </div>
      
      <div v-else class="analysis-content">
        <!-- 分析概览 -->
        <div class="analysis-overview">
          <div class="overview-stats">
            <div class="stat-item">
              <span class="stat-label">数据大小</span>
              <span class="stat-value">{{ currentAnalysis?.dataSize }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">测试算法</span>
              <span class="stat-value">{{ currentAnalysis?.results.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">测试轮数</span>
              <span class="stat-value">{{ currentAnalysis?.iterations }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">分析时间</span>
              <span class="stat-value">{{ formatTimestamp(currentAnalysis?.timestamp) }}</span>
            </div>
          </div>
        </div>

        <!-- 图表展示 -->
        <div class="charts-section">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>执行时间对比</template>
                <div class="chart-container">
                  <canvas ref="timeChartCanvas"></canvas>
                </div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>操作次数对比</template>
                <div class="chart-container">
                  <canvas ref="operationsChartCanvas"></canvas>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 详细结果表格 -->
        <div class="results-table">
          <el-card>
            <template #header>详细分析结果</template>
            <el-table :data="analysisResults" stripe>
              <el-table-column prop="algorithm" label="算法" width="120">
                <template #default="{ row }">
                  <el-tag :type="getAlgorithmTagType(row.algorithm)">
                    {{ getAlgorithmDisplayName(row.algorithm) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="executionTime" label="执行时间 (ms)" width="130">
                <template #default="{ row }">
                  <span :class="getTimeClass(row.executionTime)">
                    {{ row.executionTime.toFixed(3) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="comparisons" label="比较次数" width="120">
                <template #default="{ row }">
                  {{ row.comparisons.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column prop="swaps" label="交换次数" width="120">
                <template #default="{ row }">
                  {{ row.swaps.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column label="时间复杂度" width="200">
                <template #default="{ row }">
                  <div class="complexity-cell">
                    <div class="complexity-item">
                      <span class="complexity-type">最好:</span>
                      <code>{{ row.timeComplexity.best }}</code>
                    </div>
                    <div class="complexity-item">
                      <span class="complexity-type">平均:</span>
                      <code>{{ row.timeComplexity.average }}</code>
                    </div>
                    <div class="complexity-item">
                      <span class="complexity-type">最坏:</span>
                      <code>{{ row.timeComplexity.worst }}</code>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="spaceComplexity" label="空间复杂度" width="120">
                <template #default="{ row }">
                  <code>{{ row.spaceComplexity }}</code>
                </template>
              </el-table-column>
              <el-table-column label="特性" width="150">
                <template #default="{ row }">
                  <div class="features-cell">
                    <el-tag v-if="row.stability" type="success" size="small">稳定</el-tag>
                    <el-tag v-else type="info" size="small">不稳定</el-tag>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>
    </el-card>

    <!-- 分析配置对话框 -->
    <el-dialog
      v-model="analysisDialogVisible"
      title="性能分析配置"
      width="600px"
    >
      <el-form :model="analysisConfig" label-width="120px">
        <el-form-item label="测试数据">
          <el-radio-group v-model="analysisConfig.dataSource">
            <el-radio value="current">使用当前数据</el-radio>
            <el-radio value="generate">生成新数据</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <div v-if="analysisConfig.dataSource === 'generate'">
          <el-form-item label="数据大小">
            <el-input-number
              v-model="analysisConfig.dataSize"
              :min="10"
              :max="1000"
              :step="10"
            />
          </el-form-item>
          <el-form-item label="数据类型">
            <el-select v-model="analysisConfig.dataType">
              <el-option label="随机数据" value="random" />
              <el-option label="已排序数据" value="sorted" />
              <el-option label="逆序数据" value="reverse" />
              <el-option label="接近有序" value="nearly_sorted" />
            </el-select>
          </el-form-item>
        </div>
        
        <el-form-item label="测试算法">
          <el-checkbox-group v-model="analysisConfig.algorithms">
            <el-checkbox value="bubble">冒泡排序</el-checkbox>
            <el-checkbox value="insertion">插入排序</el-checkbox>
            <el-checkbox value="selection">选择排序</el-checkbox>
            <el-checkbox value="quick">快速排序</el-checkbox>
            <el-checkbox value="merge">归并排序</el-checkbox>
            <el-checkbox value="heap">堆排序</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="测试轮数">
          <el-input-number
            v-model="analysisConfig.iterations"
            :min="1"
            :max="10"
            :step="1"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="analysisDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="runAnalysis"
          :loading="analyzing"
        >
          开始分析
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import { SortifyAPI, type PerformanceAnalysisResponse, type PerformanceMetrics, type SortingAlgorithm } from '../services/api';
import { ElMessage } from 'element-plus';

Chart.register(...registerables);

interface Props {
  currentData?: number[];
}

const props = defineProps<Props>();

// 响应式数据
const analysisDialogVisible = ref(false);
const analyzing = ref(false);
const currentAnalysis = ref<PerformanceAnalysisResponse | null>(null);
const analysisResults = ref<PerformanceMetrics[]>([]);

const analysisConfig = ref({
  dataSource: 'current' as 'current' | 'generate',
  dataSize: 50,
  dataType: 'random' as 'random' | 'sorted' | 'reverse' | 'nearly_sorted',
  algorithms: ['bubble', 'quick', 'merge'] as SortingAlgorithm[],
  iterations: 3
});

// 图表引用
const timeChartCanvas = ref<HTMLCanvasElement>();
const operationsChartCanvas = ref<HTMLCanvasElement>();
let timeChart: Chart | null = null;
let operationsChart: Chart | null = null;

// 计算属性
const algorithmDisplayNames: Record<SortingAlgorithm, string> = {
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

// 方法
const showAnalysisDialog = () => {
  if (props.currentData && props.currentData.length > 0) {
    analysisConfig.value.dataSource = 'current';
  } else {
    analysisConfig.value.dataSource = 'generate';
  }
  analysisDialogVisible.value = true;
};

const runAnalysis = async () => {
  if (analysisConfig.value.algorithms.length === 0) {
    ElMessage.warning('请至少选择一个算法');
    return;
  }
  
  try {
    analyzing.value = true;
    
    let testData: number[];
    
    if (analysisConfig.value.dataSource === 'current' && props.currentData) {
      testData = props.currentData;
    } else {
      const response = await SortifyAPI.generateData({
        size: analysisConfig.value.dataSize,
        type: analysisConfig.value.dataType,
        min: 1,
        max: 100
      });
      testData = response.data;
    }
    
    const response = await SortifyAPI.getPerformanceAnalysis({
      data: testData,
      algorithms: analysisConfig.value.algorithms,
      iterations: analysisConfig.value.iterations
    });
    
    currentAnalysis.value = response;
    analysisResults.value = response.results;
    
    analysisDialogVisible.value = false;
    ElMessage.success('性能分析完成');
    
    // 更新图表
    await nextTick();
    updateCharts();
    
  } catch (error) {
    console.error('性能分析失败:', error);
    ElMessage.error('性能分析失败，请检查网络连接');
  } finally {
    analyzing.value = false;
  }
};

const updateCharts = () => {
  if (!timeChartCanvas.value || !operationsChartCanvas.value) return;
  
  const labels = analysisResults.value.map(result => 
    getAlgorithmDisplayName(result.algorithm)
  );
  
  // 执行时间图表
  if (timeChart) timeChart.destroy();
  timeChart = new Chart(timeChartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '执行时间 (ms)',
        data: analysisResults.value.map(result => result.executionTime),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '时间 (毫秒)'
          }
        }
      }
    }
  });
  
  // 操作次数图表
  if (operationsChart) operationsChart.destroy();
  operationsChart = new Chart(operationsChartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '比较次数',
          data: analysisResults.value.map(result => result.comparisons),
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: '交换次数',
          data: analysisResults.value.map(result => result.swaps),
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '次数'
          }
        }
      }
    }
  });
};

const getAlgorithmDisplayName = (algorithm: SortingAlgorithm): string => {
  return algorithmDisplayNames[algorithm] || algorithm;
};

const getAlgorithmTagType = (algorithm: SortingAlgorithm): string => {
  const types: Record<string, string> = {
    bubble: 'warning',
    insertion: 'success',
    selection: 'info',
    quick: 'danger',
    merge: 'primary',
    heap: 'success'
  };
  return types[algorithm] || 'info';
};

const getTimeClass = (time: number): string => {
  const maxTime = Math.max(...analysisResults.value.map(r => r.executionTime));
  const ratio = time / maxTime;
  
  if (ratio < 0.3) return 'time-fast';
  if (ratio < 0.7) return 'time-medium';
  return 'time-slow';
};

const formatTimestamp = (timestamp?: string): string => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('zh-CN');
};

// 清理图表
onMounted(() => {
  return () => {
    if (timeChart) timeChart.destroy();
    if (operationsChart) operationsChart.destroy();
  };
});
</script>

<style scoped>
.performance-analysis {
  margin-bottom: 20px;
}

.analysis-card {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.analysis-content {
  margin-top: 20px;
}

.analysis-overview {
  margin-bottom: 30px;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.charts-section {
  margin-bottom: 30px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  height: 300px;
  position: relative;
}

.results-table {
  margin-top: 20px;
}

.complexity-cell {
  font-size: 12px;
}

.complexity-item {
  margin-bottom: 2px;
}

.complexity-type {
  color: #666;
  margin-right: 5px;
}

.features-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.time-fast {
  color: #67c23a;
  font-weight: bold;
}

.time-medium {
  color: #e6a23c;
  font-weight: bold;
}

.time-slow {
  color: #f56c6c;
  font-weight: bold;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-section .el-col {
    margin-bottom: 20px;
  }
  
  .chart-card {
    height: 300px;
  }
  
  .chart-container {
    height: 200px;
  }
}
</style>
