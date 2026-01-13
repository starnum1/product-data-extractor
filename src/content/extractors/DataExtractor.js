import { DimensionExtractor } from './DimensionExtractor.js';
import { WeightExtractor } from './WeightExtractor.js';
import { CommissionExtractor } from './CommissionExtractor.js';
import { PriceExtractor } from './PriceExtractor.js';
import { ExtractionStrategy } from './strategies/ExtractionStrategy.js';
import { ShippingCalculator } from '../calculators/ShippingCalculator.js';

export class DataExtractor {
  constructor() {
    this.dimensionExtractor = new DimensionExtractor();
    this.weightExtractor = new WeightExtractor();
    this.commissionExtractor = new CommissionExtractor();
    this.priceExtractor = new PriceExtractor();
    this.strategy = new ExtractionStrategy();
    this.shippingCalculator = new ShippingCalculator();
  }

  async extract() {
    const result = {
      success: false,
      dimensions: null,
      weight: null,
      commission: null,
      price: null,
      shipping: null,
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

      // 计算运费
      result.shipping = this.calculateShipping(result);

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

  /**
   * 计算运费
   */
  calculateShipping(result) {
    // 获取卢布价格
    const priceRUB = this.extractPriceNumber(result.price?.greenPriceRUB);
    
    // 获取重量（克）
    const weightG = this.extractWeightInGrams(result.weight);
    
    // 获取尺寸
    const dimensions = this.extractDimensionsInCm(result.dimensions);

    if (!priceRUB || !weightG || !dimensions) {
      return {
        success: false,
        error: '缺少计算运费所需的数据（价格/重量/尺寸）',
      };
    }

    return this.shippingCalculator.calculate({
      priceRUB,
      weightG,
      dimensions,
    });
  }

  /**
   * 从价格字符串提取数值
   */
  extractPriceNumber(priceStr) {
    if (!priceStr) return null;
    const cleaned = priceStr.replace(/[₽\s]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  /**
   * 提取重量（转换为克）
   */
  extractWeightInGrams(weight) {
    if (!weight) return null;
    
    // 对象格式: {value: '9500', unit: 'g'}
    if (typeof weight === 'object' && weight.value) {
      const value = parseFloat(weight.value);
      const unit = (weight.unit || 'g').toLowerCase();
      if (unit === 'kg' || unit === 'кг' || unit === '千克') {
        return value * 1000;
      }
      return value;
    }
    
    // 数字格式
    if (typeof weight === 'number') return weight;
    
    // 字符串格式: "500 g" 或 "0.5 kg"
    if (typeof weight === 'string') {
      const match = weight.match(/([\d.]+)\s*(g|kg|г|кг|克|千克)/i);
      if (match) {
        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        if (unit === 'kg' || unit === 'кг' || unit === '千克') {
          return value * 1000;
        }
        return value;
      }
    }
    return null;
  }

  /**
   * 提取尺寸（转换为厘米）
   */
  extractDimensionsInCm(dimensions) {
    if (!dimensions) return null;
    
    // 对象格式: {length: '470', width: '360', height: '270', unit: 'mm'}
    if (typeof dimensions === 'object' && dimensions.length && dimensions.width && dimensions.height) {
      let length = parseFloat(dimensions.length);
      let width = parseFloat(dimensions.width);
      let height = parseFloat(dimensions.height);
      
      // 如果单位是 mm，转换为 cm
      const unit = (dimensions.unit || 'cm').toLowerCase();
      if (unit === 'mm' || unit === 'мм') {
        length = length / 10;
        width = width / 10;
        height = height / 10;
      } else if (unit === 'm' || unit === 'м') {
        length = length * 100;
        width = width * 100;
        height = height * 100;
      }
      
      return { length, width, height };
    }
    
    // 字符串格式: "10x20x30 cm"
    if (typeof dimensions === 'string') {
      const match = dimensions.match(/(\d+)\s*[xX×]\s*(\d+)\s*[xX×]\s*(\d+)/);
      if (match) {
        return {
          length: parseInt(match[1]),
          width: parseInt(match[2]),
          height: parseInt(match[3]),
        };
      }
    }
    return null;
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
    console.log('运费:', result.shipping);
    console.log('其他数据:', result.allData);
  }

  /**
   * 使用自定义值重新计算运费
   * @param {Object} originalData 原始提取数据
   * @param {Object} customValues 自定义值 {customWeight, customRate, customDimensions}
   */
  async recalculateShipping(originalData, { customWeight, customRate, customDimensions }) {
    const result = {
      shipping: null,
      price: null,
    };

    if (!originalData) {
      result.shipping = { success: false, error: '请先提取数据' };
      return result;
    }

    // 使用自定义重量或原始重量
    let weightG = customWeight;
    if (!weightG) {
      weightG = this.extractWeightInGrams(originalData.weight);
    }

    // 使用自定义汇率或原始汇率
    let exchangeRate = customRate;
    if (!exchangeRate) {
      exchangeRate = originalData.price?.exchangeRate;
    }

    // 使用自定义尺寸或原始尺寸
    let dimensions = customDimensions;
    if (!dimensions) {
      dimensions = this.extractDimensionsInCm(originalData.dimensions);
    }

    // 如果使用了自定义汇率，重新计算卢布价格
    let priceRUB;
    if (customRate && originalData.price?.greenPrice) {
      const greenPriceCNY = this.extractPriceCNY(originalData.price.greenPrice);
      priceRUB = greenPriceCNY * customRate;
      
      // 更新价格信息
      result.price = {
        ...originalData.price,
        greenPriceRUB: priceRUB.toFixed(2) + ' ₽',
        grayPriceRUB: originalData.price.grayPrice 
          ? (this.extractPriceCNY(originalData.price.grayPrice) * customRate).toFixed(2) + ' ₽'
          : null,
        exchangeRate: customRate,
      };
    } else {
      priceRUB = this.extractPriceNumber(originalData.price?.greenPriceRUB);
    }

    if (!priceRUB || !weightG || !dimensions) {
      result.shipping = {
        success: false,
        error: '缺少计算运费所需的数据（价格/重量/尺寸）',
      };
      return result;
    }

    result.shipping = this.shippingCalculator.calculate({
      priceRUB,
      weightG,
      dimensions,
    });

    return result;
  }

  /**
   * 从人民币价格字符串提取数值
   */
  extractPriceCNY(priceStr) {
    if (!priceStr) return null;
    const cleaned = priceStr.replace(/[¥\s]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
}
