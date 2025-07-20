<template>
  <div class="algorithm-selector">
    <el-card class="selector-card">
      <template #header>
        <div class="card-header">
          <span>选择排序算法</span>
          <el-button 
            text 
            type="primary" 
            @click="showRecommendations"
            :icon="'MagicStick'"
          >
            获取推荐
          </el-button>
        </div>
      </template>
      
      <div class="algorithm-grid">
        <div
          v-for="algorithm in algorithms"
          :key="algorithm.name"
          class="algorithm-card"
          :class="{ 'selected': selectedAlgorithm === algorithm.name }"
          @click="selectAlgorithm(algorithm.name)"
        >
          <div class="algorithm-header">
            <h4>{{ algorithm.displayName }}</h4>
            <div class="algorithm-badges">
              <el-tag v-if="algorithm.stability" type="success" size="small">稳定</el-tag>
              <el-tag v-if="algorithm.inPlace" type="info" size="small">原地</el-tag>
              <el-tag v-if="algorithm.adaptive" type="warning" size="small">自适应</el-tag>
            </div>
          </div>
          
          <div class="algorithm-description">
            {{ algorithm.description }}
          </div>
          
          <div class="complexity-info">
            <div class="complexity-item">
              <span class="complexity-label">时间复杂度:</span>
              <div class="complexity-values">
                <span class="complexity-value best">最好: {{ algorithm.timeComplexity.best }}</span>
                <span class="complexity-value average">平均: {{ algorithm.timeComplexity.average }}</span>
                <span class="complexity-value worst">最坏: {{ algorithm.timeComplexity.worst }}</span>
              </div>
            </div>
            <div class="complexity-item">
              <span class="complexity-label">空间复杂度:</span>
              <span class="complexity-value">{{ algorithm.spaceComplexity }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="action-section" v-if="selectedAlgorithm">
        <el-button 
          type="primary" 
          size="large"
          @click="confirmSelection"
          style="width: 100%"
        >
          使用 {{ getSelectedAlgorithmName() }} 进行排序
        </el-button>
      </div>
    </el-card>

    <!-- 推荐对话框 -->
    <el-dialog
      v-model="recommendationDialogVisible"
      title="算法推荐"
      width="600px"
    >
      <div class="recommendation-form">
        <el-form :model="recommendationParams" label-width="120px">
          <el-form-item label="数据大小">
            <el-input-number
              v-model="recommendationParams.dataSize"
              :min="1"
              :max="10000"
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="数据特征">
            <el-checkbox v-model="recommendationParams.isNearlySorted">
              数据接近有序
            </el-checkbox>
          </el-form-item>
        </el-form>
        
        <el-button 
          type="primary" 
          @click="getRecommendations"
          :loading="loadingRecommendations"
        >
          获取推荐
        </el-button>
      </div>
      
      <div v-if="recommendations.length > 0" class="recommendations">
        <el-divider>推荐算法</el-divider>
        <div class="recommendation-list">
          <div
            v-for="(rec, index) in recommendations"
            :key="rec.name"
            class="recommendation-item"
            @click="selectRecommendedAlgorithm(rec.name)"
          >
            <div class="recommendation-rank">{{ index + 1 }}</div>
            <div class="recommendation-info">
              <h5>{{ rec.displayName }}</h5>
              <p>{{ rec.description }}</p>
              <div class="recommendation-complexity">
                平均时间复杂度: {{ rec.timeComplexity.average }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SortifyAPI, type AlgorithmInfo, type SortingAlgorithm } from '../services/api';
import { ElMessage } from 'element-plus';

interface Props {
  dataSize?: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  algorithmSelected: [algorithm: SortingAlgorithm];
}>();

// 响应式数据
const algorithms = ref<AlgorithmInfo[]>([]);
const selectedAlgorithm = ref<SortingAlgorithm | null>(null);
const loading = ref(false);

// 推荐相关
const recommendationDialogVisible = ref(false);
const loadingRecommendations = ref(false);
const recommendations = ref<AlgorithmInfo[]>([]);
const recommendationParams = ref({
  dataSize: props.dataSize || 50,
  isNearlySorted: false
});

// 获取所有算法
const loadAlgorithms = async () => {
  try {
    loading.value = true;
    // 只显示已实现的算法
    const implementedAlgorithms = ['bubble', 'quick', 'merge', 'insertion', 'selection', 'heap'];
    const allAlgorithms = await SortifyAPI.getAllAlgorithms();
    algorithms.value = allAlgorithms.filter(algo => 
      implementedAlgorithms.includes(algo.name)
    );
  } catch (error) {
    console.error('加载算法失败:', error);
    ElMessage.error('加载算法信息失败');
  } finally {
    loading.value = false;
  }
};

// 选择算法
const selectAlgorithm = (algorithm: SortingAlgorithm) => {
  selectedAlgorithm.value = algorithm;
};

// 确认选择
const confirmSelection = () => {
  if (selectedAlgorithm.value) {
    emit('algorithmSelected', selectedAlgorithm.value);
    ElMessage.success(`已选择 ${getSelectedAlgorithmName()}`);
  }
};

// 获取选中算法的显示名称
const getSelectedAlgorithmName = () => {
  const algorithm = algorithms.value.find(algo => algo.name === selectedAlgorithm.value);
  return algorithm?.displayName || '';
};

// 显示推荐对话框
const showRecommendations = () => {
  recommendationParams.value.dataSize = props.dataSize || 50;
  recommendationDialogVisible.value = true;
};

// 获取推荐
const getRecommendations = async () => {
  try {
    loadingRecommendations.value = true;
    const recs = await SortifyAPI.getAlgorithmRecommendations({
      dataSize: recommendationParams.value.dataSize,
      isNearlySorted: recommendationParams.value.isNearlySorted
    });
    
    // 只显示已实现的算法
    const implementedAlgorithms = ['bubble', 'quick', 'merge', 'insertion', 'selection', 'heap'];
    recommendations.value = recs.filter(rec => 
      implementedAlgorithms.includes(rec.name)
    );
    
    if (recommendations.value.length === 0) {
      ElMessage.warning('没有找到合适的推荐算法');
    }
  } catch (error) {
    console.error('获取推荐失败:', error);
    ElMessage.error('获取算法推荐失败');
  } finally {
    loadingRecommendations.value = false;
  }
};

// 选择推荐的算法
const selectRecommendedAlgorithm = (algorithm: SortingAlgorithm) => {
  selectedAlgorithm.value = algorithm;
  recommendationDialogVisible.value = false;
  ElMessage.success(`已选择推荐算法: ${getSelectedAlgorithmName()}`);
};

// 初始化
onMounted(() => {
  loadAlgorithms();
});
</script>

<style scoped>
.algorithm-selector {
  margin-bottom: 20px;
}

.selector-card {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.algorithm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.algorithm-card {
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(to bottom, #ffffff, #fafafa);
  position: relative;
  overflow: hidden;
}

.algorithm-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: translateY(-100%);
  transition: transform 0.3s ease;
}

.algorithm-card:hover {
  border-color: #667eea;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  transform: translateY(-3px);
}

.algorithm-card:hover::before {
  transform: translateY(0);
}

.algorithm-card.selected {
  border-color: #667eea;
  background: linear-gradient(to bottom, #f0f5ff, #e6ecff);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.algorithm-card.selected::before {
  transform: translateY(0);
}

.algorithm-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.algorithm-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.algorithm-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.algorithm-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.complexity-info {
  border-top: 1px solid #eee;
  padding-top: 12px;
}

.complexity-item {
  margin-bottom: 8px;
}

.complexity-item:last-child {
  margin-bottom: 0;
}

.complexity-label {
  font-size: 12px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.complexity-values {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.complexity-value {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #666;
}

.complexity-value.best {
  background: #f0f9ff;
  color: #409eff;
}

.complexity-value.average {
  background: #fdf6ec;
  color: #e6a23c;
}

.complexity-value.worst {
  background: #fef0f0;
  color: #f56c6c;
}

.action-section {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.recommendation-form {
  margin-bottom: 20px;
}

.recommendations {
  margin-top: 20px;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recommendation-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.recommendation-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.recommendation-info h5 {
  margin: 0 0 4px 0;
  color: #2c3e50;
}

.recommendation-info p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
}

.recommendation-complexity {
  font-size: 12px;
  color: #999;
}

@media (max-width: 768px) {
  .algorithm-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .algorithm-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .complexity-values {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
