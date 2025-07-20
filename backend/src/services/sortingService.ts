import { SortingAlgorithm, SortStep, PerformanceMetrics } from '../types/index.js';

export class SortingService {
  private steps: SortStep[] = [];
  private comparisons = 0;
  private swaps = 0;
  private stepCounter = 0;

  // 重置计数器
  private reset() {
    this.steps = [];
    this.comparisons = 0;
    this.swaps = 0;
    this.stepCounter = 0;
  }

  // 添加步骤
  private addStep(
    array: number[],
    description: string,
    comparing?: number[],
    swapping?: number[],
    sorted?: number[],
    pivot?: number
  ) {
    this.steps.push({
      array: [...array],
      comparing,
      swapping,
      sorted,
      pivot,
      step: this.stepCounter++,
      description,
    });
  }

  // 冒泡排序
  bubbleSort(data: number[]): { steps: SortStep[]; metrics: PerformanceMetrics } {
    this.reset();
    const arr = [...data];
    const n = arr.length;
    
    this.addStep(arr, '开始冒泡排序');

    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      
      for (let j = 0; j < n - i - 1; j++) {
        this.addStep(arr, `比较 ${arr[j]} 和 ${arr[j + 1]}`, [j, j + 1]);
        this.comparisons++;
        
        if (arr[j] > arr[j + 1]) {
          // 交换
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          this.swaps++;
          swapped = true;
          this.addStep(arr, `交换 ${arr[j + 1]} 和 ${arr[j]}`, undefined, [j, j + 1]);
        }
      }
      
      // 标记已排序的元素
      const sorted = Array.from({ length: n - i }, (_, idx) => n - 1 - idx);
      this.addStep(arr, `第 ${i + 1} 轮完成`, undefined, undefined, sorted);
      
      if (!swapped) break;
    }

    this.addStep(arr, '冒泡排序完成', undefined, undefined, Array.from({ length: n }, (_, i) => i));

    return {
      steps: this.steps,
      metrics: this.getMetrics('bubble', data.length),
    };
  }

  // 快速排序
  quickSort(data: number[]): { steps: SortStep[]; metrics: PerformanceMetrics } {
    this.reset();
    const arr = [...data];
    
    this.addStep(arr, '开始快速排序');
    this.quickSortHelper(arr, 0, arr.length - 1);
    this.addStep(arr, '快速排序完成', undefined, undefined, Array.from({ length: arr.length }, (_, i) => i));

    return {
      steps: this.steps,
      metrics: this.getMetrics('quick', data.length),
    };
  }

  private quickSortHelper(arr: number[], low: number, high: number) {
    if (low < high) {
      const pi = this.partition(arr, low, high);
      this.quickSortHelper(arr, low, pi - 1);
      this.quickSortHelper(arr, pi + 1, high);
    }
  }

  private partition(arr: number[], low: number, high: number): number {
    const pivot = arr[high];
    this.addStep(arr, `选择基准值: ${pivot}`, undefined, undefined, undefined, high);
    
    let i = low - 1;

    for (let j = low; j < high; j++) {
      this.addStep(arr, `比较 ${arr[j]} 与基准值 ${pivot}`, [j, high]);
      this.comparisons++;
      
      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          this.swaps++;
          this.addStep(arr, `交换 ${arr[j]} 和 ${arr[i]}`, undefined, [i, j]);
        }
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    this.swaps++;
    this.addStep(arr, `将基准值放到正确位置`, undefined, [i + 1, high]);

    return i + 1;
  }

  // 归并排序
  mergeSort(data: number[]): { steps: SortStep[]; metrics: PerformanceMetrics } {
    this.reset();
    const arr = [...data];
    
    this.addStep(arr, '开始归并排序');
    this.mergeSortHelper(arr, 0, arr.length - 1);
    this.addStep(arr, '归并排序完成', undefined, undefined, Array.from({ length: arr.length }, (_, i) => i));

    return {
      steps: this.steps,
      metrics: this.getMetrics('merge', data.length),
    };
  }

  private mergeSortHelper(arr: number[], left: number, right: number) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      
      this.addStep(arr, `分割数组: [${left}..${mid}] 和 [${mid + 1}..${right}]`);
      
      this.mergeSortHelper(arr, left, mid);
      this.mergeSortHelper(arr, mid + 1, right);
      this.merge(arr, left, mid, right);
    }
  }

  private merge(arr: number[], left: number, mid: number, right: number) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;

    this.addStep(arr, `合并 [${leftArr.join(',')}] 和 [${rightArr.join(',')}]`);

    while (i < leftArr.length && j < rightArr.length) {
      this.comparisons++;
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      this.addStep(arr, `放置元素 ${arr[k]} 到位置 ${k}`, [k]);
      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      this.addStep(arr, `放置剩余元素 ${arr[k]}`, [k]);
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      this.addStep(arr, `放置剩余元素 ${arr[k]}`, [k]);
      j++;
      k++;
    }
  }

  // 插入排序
  insertionSort(data: number[]): { steps: SortStep[]; metrics: PerformanceMetrics } {
    this.reset();
    const arr = [...data];
    
    this.addStep(arr, '开始插入排序', undefined, undefined, [0]);

    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;
      
      this.addStep(arr, `选择元素 ${key} 进行插入`, [i]);

      while (j >= 0 && arr[j] > key) {
        this.comparisons++;
        arr[j + 1] = arr[j];
        this.addStep(arr, `移动 ${arr[j]} 向右`, [j, j + 1]);
        j--;
      }
      
      if (j >= 0) this.comparisons++;
      arr[j + 1] = key;
      this.swaps++;
      
      const sorted = Array.from({ length: i + 1 }, (_, idx) => idx);
      this.addStep(arr, `插入 ${key} 到位置 ${j + 1}`, [j + 1], undefined, sorted);
    }

    this.addStep(arr, '插入排序完成', undefined, undefined, Array.from({ length: arr.length }, (_, i) => i));

    return {
      steps: this.steps,
      metrics: this.getMetrics('insertion', data.length),
    };
  }

  // 选择排序
  selectionSort(data: number[]): { steps: SortStep[]; metrics: PerformanceMetrics } {
    this.reset();
    const arr = [...data];

    this.addStep(arr, '开始选择排序');

    for (let i = 0; i < arr.length - 1; i++) {
      let minIdx = i;
      this.addStep(arr, `寻找从位置 ${i} 开始的最小元素`, [i]);

      for (let j = i + 1; j < arr.length; j++) {
        this.addStep(arr, `比较 ${arr[j]} 和当前最小值 ${arr[minIdx]}`, [j, minIdx]);
        this.comparisons++;

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          this.addStep(arr, `找到新的最小值 ${arr[minIdx]}`, [minIdx]);
        }
      }

      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        this.swaps++;
        this.addStep(arr, `交换 ${arr[minIdx]} 和 ${arr[i]}`, undefined, [i, minIdx]);
      }

      const sorted = Array.from({ length: i + 1 }, (_, idx) => idx);
      this.addStep(arr, `第 ${i + 1} 个最小元素已就位`, undefined, undefined, sorted);
    }

    this.addStep(arr, '选择排序完成', undefined, undefined, Array.from({ length: arr.length }, (_, i) => i));

    return {
      steps: this.steps,
      metrics: this.getMetrics('selection', data.length),
    };
  }

  // 堆排序
  heapSort(data: number[]): { steps: SortStep[]; metrics: PerformanceMetrics } {
    this.reset();
    const arr = [...data];
    const n = arr.length;

    this.addStep(arr, '开始堆排序 - 构建最大堆');

    // 构建最大堆
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      this.heapify(arr, n, i);
    }

    this.addStep(arr, '最大堆构建完成');

    // 逐个提取元素
    for (let i = n - 1; i > 0; i--) {
      [arr[0], arr[i]] = [arr[i], arr[0]];
      this.swaps++;
      this.addStep(arr, `将最大元素 ${arr[i]} 移到末尾`, undefined, [0, i]);

      const sorted = Array.from({ length: n - i }, (_, idx) => n - 1 - idx);
      this.addStep(arr, `已排序区域扩大`, undefined, undefined, sorted);

      this.heapify(arr, i, 0);
    }

    this.addStep(arr, '堆排序完成', undefined, undefined, Array.from({ length: n }, (_, i) => i));

    return {
      steps: this.steps,
      metrics: this.getMetrics('heap', data.length),
    };
  }

  private heapify(arr: number[], n: number, i: number) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n) {
      this.comparisons++;
      if (arr[left] > arr[largest]) {
        largest = left;
      }
    }

    if (right < n) {
      this.comparisons++;
      if (arr[right] > arr[largest]) {
        largest = right;
      }
    }

    if (largest !== i) {
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      this.swaps++;
      this.addStep(arr, `调整堆结构`, undefined, [i, largest]);
      this.heapify(arr, n, largest);
    }
  }

  // 获取性能指标
  private getMetrics(algorithm: SortingAlgorithm, dataSize: number): PerformanceMetrics {
    const algorithmInfo = {
      bubble: {
        timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1)',
        stability: true,
      },
      quick: {
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
        spaceComplexity: 'O(log n)',
        stability: false,
      },
      merge: {
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
        spaceComplexity: 'O(n)',
        stability: true,
      },
      insertion: {
        timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1)',
        stability: true,
      },
      selection: {
        timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
        spaceComplexity: 'O(1)',
        stability: false,
      },
      heap: {
        timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
        spaceComplexity: 'O(1)',
        stability: false,
      },
      shell: {
        timeComplexity: { best: 'O(n)', average: 'O(n^{1.5})', worst: 'O(n²)' },
        spaceComplexity: 'O(1)',
        stability: false,
      },
      counting: {
        timeComplexity: { best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n+k)' },
        spaceComplexity: 'O(k)',
        stability: true,
      },
      radix: {
        timeComplexity: { best: 'O(nk)', average: 'O(nk)', worst: 'O(nk)' },
        spaceComplexity: 'O(n+k)',
        stability: true,
      },
      bucket: {
        timeComplexity: { best: 'O(n+k)', average: 'O(n+k)', worst: 'O(n²)' },
        spaceComplexity: 'O(n+k)',
        stability: true,
      },
    };

    const info = algorithmInfo[algorithm] || algorithmInfo.bubble;

    return {
      algorithm,
      executionTime: 0, // 将在实际执行时计算
      comparisons: this.comparisons,
      swaps: this.swaps,
      stability: info.stability,
      timeComplexity: info.timeComplexity,
      spaceComplexity: info.spaceComplexity,
    };
  }

  // 执行排序并计算性能
  async executeSort(algorithm: SortingAlgorithm, data: number[]) {
    const startTime = performance.now();

    let result;
    switch (algorithm) {
      case 'bubble':
        result = this.bubbleSort(data);
        break;
      case 'quick':
        result = this.quickSort(data);
        break;
      case 'merge':
        result = this.mergeSort(data);
        break;
      case 'insertion':
        result = this.insertionSort(data);
        break;
      case 'selection':
        result = this.selectionSort(data);
        break;
      case 'heap':
        result = this.heapSort(data);
        break;
      default:
        throw new Error(`不支持的排序算法: ${algorithm}`);
    }

    const endTime = performance.now();
    result.metrics.executionTime = endTime - startTime;

    return result;
  }
}
