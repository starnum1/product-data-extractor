/**
 * 价格提取器 - 提取绿标价格和灰标价格
 */
export class PriceExtractor {
  constructor() {
    // 绿标价格选择器 (Ozon卡价格)
    this.greenPriceSelector = 'span.tsHeadline600Large';
    // 灰标价格选择器 (普通价格)
    this.grayPriceSelector = 'span.pdp_bg4.tsHeadline500Medium';
  }

  extract() {
    return {
      greenPrice: this.extractGreenPrice(),
      grayPrice: this.extractGrayPrice(),
    };
  }

  /**
   * 提取绿标价格 (Ozon卡价格)
   */
  extractGreenPrice() {
    const element = document.querySelector(this.greenPriceSelector);
    if (element) {
      return this.parsePrice(element.textContent);
    }
    return null;
  }

  /**
   * 提取灰标价格 (普通价格)
   */
  extractGrayPrice() {
    const element = document.querySelector(this.grayPriceSelector);
    if (element) {
      return this.parsePrice(element.textContent);
    }
    return null;
  }

  /**
   * 解析价格文本，提取数值
   */
  parsePrice(text) {
    if (!text) return null;
    
    // 清理文本，移除空格和换行
    const cleaned = text.trim().replace(/\s+/g, ' ');
    
    // 匹配价格格式: 800,33 ¥ 或 800.33 ¥ 或 800 ¥
    const match = cleaned.match(/([\d\s,.]+)\s*[¥₽]/);
    if (match) {
      // 返回原始格式的价格字符串
      return match[1].trim() + ' ¥';
    }
    
    return cleaned;
  }
}
