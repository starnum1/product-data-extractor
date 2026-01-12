import { DimensionExtractor } from './DimensionExtractor.js';
import { WeightExtractor } from './WeightExtractor.js';
import { CommissionExtractor } from './CommissionExtractor.js';
import { PriceExtractor } from './PriceExtractor.js';
import { ExtractionStrategy } from './strategies/ExtractionStrategy.js';

export class DataExtractor {
  constructor() {
    this.dimensionExtractor = new DimensionExtractor();
    this.weightExtractor = new WeightExtractor();
    this.commissionExtractor = new CommissionExtractor();
    this.priceExtractor = new PriceExtractor();
    this.strategy = new ExtractionStrategy();
  }

  async extract() {
    const result = {
      success: false,
      dimensions: null,
      weight: null,
      commission: null,
      price: null,
      allData: {},
      error: null,
      debug: [],
    };

    try {
      // 使用策略模式提取数据
      result.dimensions = this.strategy.extractDimensions(this.dimensionExtractor);
      result.weight = this.strategy.extractWeight(this.weightExtractor);
      result.commission = this.commissionExtractor.extract();
      result.price = await this.priceExtractor.extract();

      // 提取其他数据
      result.allData = this.extractAdditionalData();

      result.success = !!(result.dimensions || result.weight || result.commission || result.price?.greenPrice || result.price?.grayPrice);

      if (!result.success) {
        result.error = '未找到尺寸、重量、佣金或价格数据，请确保数据卡片已加载';
      }

      this.logDebugInfo(result);
    } catch (error) {
      result.error = error.message;
      console.error('提取错误:', error);
    }

    return result;
  }

  extractAdditionalData() {
    const dataPatterns = [
      { key: '商品卡浏览量', pattern: /商品卡浏览量[：:\s]*(\d+)/ },
      { key: '商品卡加购率', pattern: /商品卡加购率[：:\s]*([\d.]+%)/ },
      { key: '商品点击率', pattern: /商品点击率[：:\s]*([\d.]+%)/ },
      { key: '发货模式', pattern: /发货模式[：:\s]*(\w+)/ },
      { key: '退货取消率', pattern: /退货取消率[：:\s]*([\d.]+%)/ },
      { key: '上架时间', pattern: /上架时间[：:\s]*([\d\-]+)/ },
    ];

    const bodyText = document.body.textContent;
    const allData = {};

    dataPatterns.forEach(({ key, pattern }) => {
      const match = bodyText.match(pattern);
      if (match) {
        allData[key] = match[1];
      }
    });

    return allData;
  }

  logDebugInfo(result) {
    console.log('=== 数据提取调试信息 ===');
    console.log('尺寸:', result.dimensions);
    console.log('重量:', result.weight);
    console.log('佣金:', result.commission);
    console.log('价格:', result.price);
    console.log('其他数据:', result.allData);
  }
}
