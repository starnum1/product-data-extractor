/**
 * 汇率服务 - 获取并缓存汇率数据
 */
export class ExchangeRateService {
  constructor() {
    this.API_URL = 'https://api.exchangerate-api.com/v4/latest/CNY';
    this.CACHE_KEY = 'exchangeRateCache';
    this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时
  }

  /**
   * 获取人民币对卢布汇率
   * @returns {Promise<number|null>} 汇率值 (1 CNY = ? RUB)
   */
  async getRate() {
    try {
      // 先检查缓存
      const cached = this.getFromCache();
      if (cached) {
        console.log('使用缓存汇率:', cached);
        return cached;
      }

      // 缓存过期或不存在，请求新数据
      const rate = await this.fetchRate();
      if (rate) {
        this.saveToCache(rate);
        console.log('获取新汇率:', rate);
      }
      return rate;
    } catch (error) {
      console.error('获取汇率失败:', error);
      // 如果请求失败，尝试返回过期的缓存
      return this.getFromCache(true);
    }
  }

  /**
   * 从 API 获取汇率
   */
  async fetchRate() {
    const response = await fetch(this.API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    return data.rates?.RUB || null;
  }

  /**
   * 从缓存获取汇率
   * @param {boolean} ignoreExpiry 是否忽略过期时间
   */
  getFromCache(ignoreExpiry = false) {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const { rate, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > this.CACHE_DURATION;

      if (!ignoreExpiry && isExpired) {
        return null;
      }

      return rate;
    } catch {
      return null;
    }
  }

  /**
   * 保存汇率到缓存
   */
  saveToCache(rate) {
    const data = {
      rate,
      timestamp: Date.now(),
    };
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
  }

  /**
   * 人民币转卢布
   * @param {number} cny 人民币金额
   * @param {number} rate 汇率
   * @returns {number} 卢布金额
   */
  convertToRUB(cny, rate) {
    return cny * rate;
  }
}
