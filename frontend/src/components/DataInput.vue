<template>
  <div class="data-input">
    <el-card class="input-card">
      <template #header>
        <span>数据输入</span>
      </template>
      
      <div class="input-section">
        <el-tabs v-model="inputMode" @tab-change="handleModeChange">
          <el-tab-pane label="手动输入" name="manual">
            <div class="manual-input">
              <el-input
                v-model="manualInput"
                type="textarea"
                :rows="3"
                placeholder="请输入数字，用逗号或空格分隔，例如：5,3,8,1,9 或 5 3 8 1 9"
                @input="validateManualInput"
              />
              <div class="input-help">
                <el-text size="small" type="info">
                  支持逗号、空格或换行分隔的数字，最多100个数字
                </el-text>
              </div>
              <div v-if="manualInputError" class="error-message">
                <el-text type="danger">{{ manualInputError }}</el-text>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="随机生成" name="generate">
            <div class="generate-input">
              <div class="form-row">
                <el-form-item label="数据大小">
                  <el-input-number
                    v-model="generateConfig.size"
                    :min="5"
                    :max="100"
                    :step="1"
                    style="width: 120px"
                  />
                </el-form-item>
                
                <el-form-item label="数值范围">
                  <div class="range-inputs">
                    <el-input-number
                      v-model="generateConfig.min"
                      :max="generateConfig.max - 1"
                      placeholder="最小值"
                      style="width: 100px"
                    />
                    <span style="margin: 0 10px">-</span>
                    <el-input-number
                      v-model="generateConfig.max"
                      :min="generateConfig.min + 1"
                      placeholder="最大值"
                      style="width: 100px"
                    />
                  </div>
                </el-form-item>
              </div>
              
              <div class="form-row">
                <el-form-item label="数据类型">
                  <el-select v-model="generateConfig.type" style="width: 200px">
                    <el-option label="随机数据" value="random" />
                    <el-option label="已排序数据" value="sorted" />
                    <el-option label="逆序数据" value="reverse" />
                    <el-option label="接近有序" value="nearly_sorted" />
                  </el-select>
                </el-form-item>
                
                <el-button 
                  type="primary" 
                  @click="generateData"
                  :loading="generating"
                  :icon="'Refresh'"
                >
                  生成数据
                </el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div class="preview-section" v-if="previewData.length > 0">
        <el-divider>数据预览</el-divider>
        <div class="data-preview">
          <div class="preview-stats">
            <el-tag>数量: {{ previewData.length }}</el-tag>
            <el-tag type="info">最小值: {{ Math.min(...previewData) }}</el-tag>
            <el-tag type="info">最大值: {{ Math.max(...previewData) }}</el-tag>
          </div>
          <div class="preview-array">
            <span 
              v-for="(value, index) in displayPreview" 
              :key="index"
              class="preview-item"
            >
              {{ value }}
            </span>
            <span v-if="previewData.length > maxPreviewItems" class="preview-more">
              ... 还有 {{ previewData.length - maxPreviewItems }} 个
            </span>
          </div>
        </div>
      </div>
      
      <div class="action-section">
        <el-button 
          type="success" 
          size="large"
          @click="confirmData"
          :disabled="!isDataValid"
          style="width: 100%"
        >
          确认使用此数据
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { SortifyAPI } from '../services/api';
import { ElMessage } from 'element-plus';

interface Props {
  initialData?: number[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  dataConfirmed: [data: number[]];
}>();

// 响应式数据
const inputMode = ref<'manual' | 'generate'>('manual');
const manualInput = ref('');
const manualInputError = ref('');
const generating = ref(false);

const generateConfig = ref({
  size: 20,
  min: 1,
  max: 100,
  type: 'random' as 'random' | 'sorted' | 'reverse' | 'nearly_sorted'
});

const previewData = ref<number[]>([]);
const maxPreviewItems = 20;

// 计算属性
const displayPreview = computed(() => 
  previewData.value.slice(0, maxPreviewItems)
);

const isDataValid = computed(() => 
  previewData.value.length > 0 && previewData.value.length <= 100
);

// 手动输入验证
const validateManualInput = () => {
  manualInputError.value = '';
  
  if (!manualInput.value.trim()) {
    previewData.value = [];
    return;
  }
  
  try {
    // 支持多种分隔符：逗号、空格、换行
    const numbers = manualInput.value
      .split(/[,\s\n]+/)
      .filter(item => item.trim() !== '')
      .map(item => {
        const num = parseFloat(item.trim());
        if (isNaN(num)) {
          throw new Error(`"${item}" 不是有效的数字`);
        }
        if (!Number.isInteger(num)) {
          throw new Error(`"${item}" 不是整数`);
        }
        return num;
      });
    
    if (numbers.length === 0) {
      manualInputError.value = '请输入至少一个数字';
      previewData.value = [];
      return;
    }
    
    if (numbers.length > 100) {
      manualInputError.value = '数字数量不能超过100个';
      previewData.value = [];
      return;
    }
    
    previewData.value = numbers;
  } catch (error) {
    manualInputError.value = error instanceof Error ? error.message : '输入格式错误';
    previewData.value = [];
  }
};

// 生成数据
const generateData = async () => {
  try {
    generating.value = true;
    const response = await SortifyAPI.generateData({
      size: generateConfig.value.size,
      min: generateConfig.value.min,
      max: generateConfig.value.max,
      type: generateConfig.value.type
    });
    
    previewData.value = response.data;
    ElMessage.success('数据生成成功');
  } catch (error) {
    console.error('生成数据失败:', error);
    ElMessage.error('生成数据失败，请检查网络连接');
  } finally {
    generating.value = false;
  }
};

// 模式切换处理
const handleModeChange = (mode: string) => {
  if (mode === 'generate' && previewData.value.length === 0) {
    generateData();
  }
};

// 确认数据
const confirmData = () => {
  if (isDataValid.value) {
    emit('dataConfirmed', [...previewData.value]);
    ElMessage.success(`已确认 ${previewData.value.length} 个数据`);
  }
};

// 初始化数据
if (props.initialData && props.initialData.length > 0) {
  previewData.value = [...props.initialData];
  manualInput.value = props.initialData.join(', ');
}

// 监听手动输入变化
watch(manualInput, validateManualInput, { immediate: true });
</script>

<style scoped>
.data-input {
  margin-bottom: 20px;
}

.input-card {
  max-width: 600px;
  margin: 0 auto;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.input-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.input-section {
  margin-bottom: 20px;
}

.manual-input {
  margin-top: 10px;
}

.input-help {
  margin-top: 8px;
}

.error-message {
  margin-top: 8px;
}

.generate-input {
  margin-top: 10px;
}

.form-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.range-inputs {
  display: flex;
  align-items: center;
}

.preview-section {
  margin: 20px 0;
}

.data-preview {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
}

.preview-stats {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.preview-array {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.preview-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.preview-item:hover {
  background: #f0f9ff;
  border-color: #409eff;
  transform: scale(1.05);
}

.preview-more {
  color: #666;
  font-style: italic;
  font-size: 14px;
}

.action-section {
  margin-top: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .range-inputs {
    justify-content: center;
  }
  
  .preview-stats {
    justify-content: center;
  }
}
</style>
