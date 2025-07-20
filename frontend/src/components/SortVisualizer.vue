<template>
  <div class="sort-visualizer">
    <div class="visualizer-header">
      <h3>{{ algorithmName }} 排序可视化</h3>
      <div class="controls">
        <el-button 
          type="primary" 
          :icon="isPlaying ? 'VideoPause' : 'VideoPlay'"
          @click="togglePlayback"
          :disabled="!hasSteps"
        >
          {{ isPlaying ? '暂停' : '播放' }}
        </el-button>
        <el-button 
          :icon="'Refresh'"
          @click="resetVisualization"
          :disabled="isPlaying"
        >
          重置
        </el-button>
        <el-button 
          :icon="'DArrowLeft'"
          @click="previousStep"
          :disabled="isPlaying || currentStep <= 0"
        >
          上一步
        </el-button>
        <el-button 
          :icon="'DArrowRight'"
          @click="nextStep"
          :disabled="isPlaying || currentStep >= totalSteps - 1"
        >
          下一步
        </el-button>
      </div>
    </div>

    <div class="speed-control">
      <span>播放速度：</span>
      <el-slider
        v-model="playbackSpeed"
        :min="100"
        :max="2000"
        :step="100"
        :format-tooltip="formatSpeedTooltip"
        style="width: 200px; margin-left: 10px;"
      />
    </div>

    <div class="step-info" v-if="currentStepData">
      <el-tag type="info">
        步骤 {{ currentStep + 1 }} / {{ totalSteps }}
      </el-tag>
      <span class="step-description">{{ currentStepData.description }}</span>
    </div>

    <div class="visualization-container" ref="visualizationContainer">
      <div class="array-container">
        <div
          v-for="(value, index) in displayArray"
          :key="`${index}-${value}`"
          class="array-element"
          :class="{
            'comparing': isComparing(index),
            'swapping': isSwapping(index),
            'sorted': isSorted(index),
            'pivot': isPivot(index)
          }"
          :style="getElementStyle(value, index)"
        >
          <div class="element-value">{{ value }}</div>
          <div class="element-bar" :style="{ height: getBarHeight(value) + 'px' }"></div>
        </div>
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <div class="legend-color comparing"></div>
        <span>正在比较</span>
      </div>
      <div class="legend-item">
        <div class="legend-color swapping"></div>
        <span>正在交换</span>
      </div>
      <div class="legend-item">
        <div class="legend-color sorted"></div>
        <span>已排序</span>
      </div>
      <div class="legend-item" v-if="showPivot">
        <div class="legend-color pivot"></div>
        <span>基准值</span>
      </div>
    </div>

    <div class="statistics" v-if="showStatistics">
      <el-card class="stats-card">
        <template #header>
          <span>统计信息</span>
        </template>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">比较次数：</span>
            <span class="stat-value">{{ statistics.comparisons }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">交换次数：</span>
            <span class="stat-value">{{ statistics.swaps }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">执行时间：</span>
            <span class="stat-value">{{ statistics.executionTime.toFixed(2) }}ms</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">数组大小：</span>
            <span class="stat-value">{{ displayArray.length }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { SortStep, PerformanceMetrics } from '../services/api';

interface Props {
  steps: SortStep[];
  algorithmName: string;
  statistics?: PerformanceMetrics;
  showStatistics?: boolean;
  autoPlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showStatistics: true,
  autoPlay: false,
});

// 响应式数据
const currentStep = ref(0);
const isPlaying = ref(false);
const playbackSpeed = ref(800); // 毫秒
const visualizationContainer = ref<HTMLElement>();

// 计算属性
const hasSteps = computed(() => props.steps.length > 0);
const totalSteps = computed(() => props.steps.length);
const currentStepData = computed(() => props.steps[currentStep.value]);
const displayArray = computed(() => currentStepData.value?.array || []);
const showPivot = computed(() => 
  props.steps.some(step => step.pivot !== undefined)
);

// 播放控制
let playbackTimer: number | null = null;

const togglePlayback = () => {
  if (isPlaying.value) {
    pausePlayback();
  } else {
    startPlayback();
  }
};

const startPlayback = () => {
  if (currentStep.value >= totalSteps.value - 1) {
    currentStep.value = 0;
  }
  isPlaying.value = true;
  scheduleNextStep();
};

const pausePlayback = () => {
  isPlaying.value = false;
  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }
};

const scheduleNextStep = () => {
  if (!isPlaying.value) return;
  
  playbackTimer = setTimeout(() => {
    if (currentStep.value < totalSteps.value - 1) {
      currentStep.value++;
      scheduleNextStep();
    } else {
      pausePlayback();
    }
  }, playbackSpeed.value);
};

const resetVisualization = () => {
  pausePlayback();
  currentStep.value = 0;
};

const nextStep = () => {
  if (currentStep.value < totalSteps.value - 1) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

// 元素状态检查
const isComparing = (index: number): boolean => {
  return currentStepData.value?.comparing?.includes(index) || false;
};

const isSwapping = (index: number): boolean => {
  return currentStepData.value?.swapping?.includes(index) || false;
};

const isSorted = (index: number): boolean => {
  return currentStepData.value?.sorted?.includes(index) || false;
};

const isPivot = (index: number): boolean => {
  return currentStepData.value?.pivot === index;
};

// 样式计算
const getElementStyle = (value: number, index: number) => {
  const baseStyle = {
    transition: 'all 0.3s ease',
  };
  
  if (isSwapping(index)) {
    return {
      ...baseStyle,
      transform: 'scale(1.1)',
    };
  }
  
  return baseStyle;
};

const getBarHeight = (value: number): number => {
  if (displayArray.value.length === 0) return 0;
  
  const maxValue = Math.max(...displayArray.value);
  const minValue = Math.min(...displayArray.value);
  const range = maxValue - minValue || 1;
  const normalizedValue = (value - minValue) / range;
  
  return Math.max(20, normalizedValue * 200 + 20);
};

const formatSpeedTooltip = (value: number): string => {
  const speed = 2100 - value; // 反转，使数值越大速度越快
  if (speed > 1500) return '很快';
  if (speed > 1000) return '快';
  if (speed > 500) return '中等';
  return '慢';
};

// 监听播放速度变化
watch(playbackSpeed, () => {
  if (isPlaying.value) {
    pausePlayback();
    startPlayback();
  }
});

// 自动播放
onMounted(() => {
  if (props.autoPlay && hasSteps.value) {
    setTimeout(() => {
      startPlayback();
    }, 1000);
  }
});

// 清理定时器
onUnmounted(() => {
  if (playbackTimer) {
    clearTimeout(playbackTimer);
  }
});

// 暴露方法给父组件
defineExpose({
  play: startPlayback,
  pause: pausePlayback,
  reset: resetVisualization,
  goToStep: (step: number) => {
    currentStep.value = Math.max(0, Math.min(step, totalSteps.value - 1));
  },
});
</script>

<style scoped>
.sort-visualizer {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.visualizer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.visualizer-header h3 {
  margin: 0;
  color: #2c3e50;
}

.controls {
  display: flex;
  gap: 10px;
}

.speed-control {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  color: #666;
}

.step-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.step-description {
  color: #666;
  font-size: 14px;
}

.visualization-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  min-height: 300px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.array-container {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.array-element {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40px;
  position: relative;
}

.element-value {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #2c3e50;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.element-bar {
  width: 30px;
  background: #3498db;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  min-height: 20px;
}

.array-element.comparing .element-bar {
  background: #f39c12;
  box-shadow: 0 0 10px rgba(243, 156, 18, 0.5);
}

.array-element.swapping .element-bar {
  background: #e74c3c;
  box-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
}

.array-element.sorted .element-bar {
  background: #27ae60;
  box-shadow: 0 0 10px rgba(39, 174, 96, 0.3);
}

.array-element.pivot .element-bar {
  background: #9b59b6;
  box-shadow: 0 0 10px rgba(155, 89, 182, 0.5);
}

.legend {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.comparing {
  background: #f39c12;
}

.legend-color.swapping {
  background: #e74c3c;
}

.legend-color.sorted {
  background: #27ae60;
}

.legend-color.pivot {
  background: #9b59b6;
}

.statistics {
  margin-top: 20px;
}

.stats-card {
  max-width: 400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
}

@media (max-width: 768px) {
  .visualizer-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .array-element {
    min-width: 30px;
  }
  
  .element-bar {
    width: 25px;
  }
  
  .legend {
    flex-wrap: wrap;
    gap: 15px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
