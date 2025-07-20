import { AlgorithmInfo, SortingAlgorithm } from '../types/index.js';

export class AlgorithmService {
  private algorithms: AlgorithmInfo[] = [
    {
      name: 'bubble',
      displayName: '冒泡排序',
      description: '通过重复遍历列表，比较相邻元素并交换它们（如果顺序错误）来工作。这个过程重复进行，直到列表排序完成。',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
      },
      spaceComplexity: 'O(1)',
      stability: true,
      inPlace: true,
      adaptive: true,
    },
    {
      name: 'quick',
      displayName: '快速排序',
      description: '选择一个基准元素，将数组分为两部分：小于基准的元素和大于基准的元素，然后递归地对这两部分进行排序。',
      timeComplexity: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n²)',
      },
      spaceComplexity: 'O(log n)',
      stability: false,
      inPlace: true,
      adaptive: false,
    },
    {
      name: 'merge',
      displayName: '归并排序',
      description: '采用分治策略，将数组分成两半，递归地对每一半进行排序，然后将排序后的两半合并。',
      timeComplexity: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
      },
      spaceComplexity: 'O(n)',
      stability: true,
      inPlace: false,
      adaptive: false,
    },
    {
      name: 'insertion',
      displayName: '插入排序',
      description: '构建最终排序的数组，一次一个元素。它从第二个元素开始，将每个元素插入到已排序部分的正确位置。',
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n²)',
        worst: 'O(n²)',
      },
      spaceComplexity: 'O(1)',
      stability: true,
      inPlace: true,
      adaptive: true,
    },
    {
      name: 'selection',
      displayName: '选择排序',
      description: '在每次迭代中找到最小（或最大）元素，并将其放在数组的开头（或结尾）。',
      timeComplexity: {
        best: 'O(n²)',
        average: 'O(n²)',
        worst: 'O(n²)',
      },
      spaceComplexity: 'O(1)',
      stability: false,
      inPlace: true,
      adaptive: false,
    },
    {
      name: 'heap',
      displayName: '堆排序',
      description: '首先构建一个最大堆，然后重复提取最大元素并将其放在数组的末尾，同时维护堆的性质。',
      timeComplexity: {
        best: 'O(n log n)',
        average: 'O(n log n)',
        worst: 'O(n log n)',
      },
      spaceComplexity: 'O(1)',
      stability: false,
      inPlace: true,
      adaptive: false,
    },
    {
      name: 'shell',
      displayName: '希尔排序',
      description: '插入排序的改进版本，通过比较相距一定间隔的元素来工作，逐渐减少间隔直到为1。',
      timeComplexity: {
        best: 'O(n log n)',
        average: 'O(n^1.3)',
        worst: 'O(n²)',
      },
      spaceComplexity: 'O(1)',
      stability: false,
      inPlace: true,
      adaptive: true,
    },
    {
      name: 'counting',
      displayName: '计数排序',
      description: '非比较排序算法，通过计算每个不同元素的出现次数来工作。适用于整数范围较小的情况。',
      timeComplexity: {
        best: 'O(n + k)',
        average: 'O(n + k)',
        worst: 'O(n + k)',
      },
      spaceComplexity: 'O(k)',
      stability: true,
      inPlace: false,
      adaptive: false,
    },
    {
      name: 'radix',
      displayName: '基数排序',
      description: '非比较排序算法，通过按位数字对元素进行排序。从最低有效位开始，逐位进行排序。',
      timeComplexity: {
        best: 'O(nk)',
        average: 'O(nk)',
        worst: 'O(nk)',
      },
      spaceComplexity: 'O(n + k)',
      stability: true,
      inPlace: false,
      adaptive: false,
    },
    {
      name: 'bucket',
      displayName: '桶排序',
      description: '将元素分布到多个桶中，对每个桶单独排序，然后连接所有桶以获得排序后的数组。',
      timeComplexity: {
        best: 'O(n + k)',
        average: 'O(n + k)',
        worst: 'O(n²)',
      },
      spaceComplexity: 'O(n)',
      stability: true,
      inPlace: false,
      adaptive: false,
    },
  ];

  // 获取所有算法信息
  getAllAlgorithms(): AlgorithmInfo[] {
    return this.algorithms;
  }

  // 根据名称获取算法信息
  getAlgorithmByName(name: SortingAlgorithm): AlgorithmInfo | undefined {
    return this.algorithms.find(algo => algo.name === name);
  }

  // 获取支持的算法名称列表
  getSupportedAlgorithms(): SortingAlgorithm[] {
    return this.algorithms.map(algo => algo.name);
  }

  // 根据特性筛选算法
  getAlgorithmsByProperty(property: keyof AlgorithmInfo, value: any): AlgorithmInfo[] {
    return this.algorithms.filter(algo => algo[property] === value);
  }

  // 获取稳定排序算法
  getStableAlgorithms(): AlgorithmInfo[] {
    return this.algorithms.filter(algo => algo.stability);
  }

  // 获取原地排序算法
  getInPlaceAlgorithms(): AlgorithmInfo[] {
    return this.algorithms.filter(algo => algo.inPlace);
  }

  // 获取自适应排序算法
  getAdaptiveAlgorithms(): AlgorithmInfo[] {
    return this.algorithms.filter(algo => algo.adaptive);
  }

  // 根据时间复杂度分类算法
  getAlgorithmsByTimeComplexity(): {
    [key: string]: AlgorithmInfo[];
  } {
    const categories: { [key: string]: AlgorithmInfo[] } = {};
    
    this.algorithms.forEach(algo => {
      const avgComplexity = algo.timeComplexity.average;
      if (!categories[avgComplexity]) {
        categories[avgComplexity] = [];
      }
      categories[avgComplexity].push(algo);
    });

    return categories;
  }

  // 推荐算法
  recommendAlgorithm(dataSize: number, isNearlysorted: boolean = false): AlgorithmInfo[] {
    const recommendations: AlgorithmInfo[] = [];

    if (dataSize < 50) {
      // 小数据集推荐插入排序
      const insertion = this.getAlgorithmByName('insertion');
      if (insertion) recommendations.push(insertion);
      
      if (isNearlysorted) {
        const bubble = this.getAlgorithmByName('bubble');
        if (bubble) recommendations.push(bubble);
      }
    } else if (dataSize < 1000) {
      // 中等数据集
      const quick = this.getAlgorithmByName('quick');
      const merge = this.getAlgorithmByName('merge');
      const heap = this.getAlgorithmByName('heap');
      
      if (quick) recommendations.push(quick);
      if (merge) recommendations.push(merge);
      if (heap) recommendations.push(heap);
    } else {
      // 大数据集
      const merge = this.getAlgorithmByName('merge');
      const heap = this.getAlgorithmByName('heap');
      const quick = this.getAlgorithmByName('quick');
      
      if (merge) recommendations.push(merge);
      if (heap) recommendations.push(heap);
      if (quick) recommendations.push(quick);
    }

    return recommendations;
  }
}
