/**
 * 利润计算器
 * 
 * 利润 = 最终售价 - (采购成本 + 国际运费 + 贴单费 + 平台佣金 + 杂费)
 * 利润率 = 利润 / 采购成本
 * 
 * 佣金挡位：
 * - 第一挡：绿标卢布售价 <= 1500，使用 commissions[0]
 * - 第二挡：绿标卢布售价 > 1500 且 <= 5000，使用 commissions[1]
 * - 第三挡：绿标卢布售价 > 5000，使用 commissions[2]
 */
export class ProfitCalculator {
  constructor() {
    this.DEFAULT_LABEL_FEE = 3; // 贴单费默认3元
    this.DEFAULT_MISC_RATE = 0.039; // 杂费默认3.9%
    this.DEFAULT_PROFIT_RATE = 0.30; // 默认利润率30%
    this.HIGH_SHIPPING_PROFIT_RATE = 0.50; // 运费>成本时利润率50%
  }

  /**
   * 计算目标售价
   * @param {Object} params 计算参数
   * @param {number} params.purchaseCost 采购成本（元）
   * @param {number} params.shippingFee 国际运费（元）
   * @param {number[]} params.commissions 佣金比例数组 [12%, 14%, 15%]
   * @param {number} params.exchangeRate 汇率 (1 CNY = ? RUB)
   * @param {number} [params.labelFee] 贴单费（元），默认3
   * @param {number} [params.miscRate] 杂费比例，默认0.039
   * @returns {Object} 计算结果
   */
  calculate({
    purchaseCost,
    shippingFee,
    commissions,
    exchangeRate,
    labelFee = this.DEFAULT_LABEL_FEE,
    miscRate = this.DEFAULT_MISC_RATE,
  }) {
    const result = {
      success: false,
      targetPriceCNY: null,
      targetPriceRUB: null,
      profit: null,
      profitRate: null,
      commissionTier: null,
      commissionRate: null,
      breakdown: {},
      error: null,
    };

    // 验证输入
    if (!purchaseCost || purchaseCost <= 0) {
      result.error = '请输入有效的采购成本';
      return result;
    }
    if (!shippingFee || shippingFee < 0) {
      result.error = '缺少运费数据';
      return result;
    }
    if (!commissions || commissions.length < 3) {
      result.error = '缺少佣金数据';
      return result;
    }
    if (!exchangeRate || exchangeRate <= 0) {
      result.error = '缺少汇率数据';
      return result;
    }

    // 确定目标利润率
    const targetProfitRate = shippingFee > purchaseCost 
      ? this.HIGH_SHIPPING_PROFIT_RATE 
      : this.DEFAULT_PROFIT_RATE;

    // 解析佣金比例
    const commissionRates = commissions.map(c => this.parseCommissionRate(c));

    // 计算目标售价（需要迭代，因为佣金挡位取决于售价）
    const targetPrice = this.findTargetPrice({
      purchaseCost,
      shippingFee,
      labelFee,
      miscRate,
      targetProfitRate,
      commissionRates,
      exchangeRate,
    });

    if (!targetPrice) {
      result.error = '无法计算出合理的售价';
      return result;
    }

    // 确定最终使用的佣金挡位
    const priceRUB = targetPrice * exchangeRate;
    const tier = this.getCommissionTier(priceRUB);
    const commissionRate = commissionRates[tier];

    // 计算各项费用
    const commission = targetPrice * commissionRate;
    const miscFee = targetPrice * miscRate;
    const totalCost = purchaseCost + shippingFee + labelFee + commission + miscFee;
    const profit = targetPrice - totalCost;

    result.success = true;
    result.targetPriceCNY = targetPrice.toFixed(2);
    result.targetPriceRUB = priceRUB.toFixed(2);
    result.profit = profit.toFixed(2);
    result.profitRate = ((profit / purchaseCost) * 100).toFixed(1) + '%';
    result.commissionTier = tier + 1;
    result.commissionRate = (commissionRate * 100).toFixed(0) + '%';
    result.breakdown = {
      purchaseCost: purchaseCost.toFixed(2),
      shippingFee: shippingFee.toFixed(2),
      labelFee: labelFee.toFixed(2),
      commission: commission.toFixed(2),
      miscFee: miscFee.toFixed(2),
      totalCost: totalCost.toFixed(2),
      targetProfitRate: (targetProfitRate * 100).toFixed(0) + '%',
    };

    return result;
  }

  /**
   * 迭代计算目标售价
   */
  findTargetPrice({ purchaseCost, shippingFee, labelFee, miscRate, targetProfitRate, commissionRates, exchangeRate }) {
    // 目标利润
    const targetProfit = purchaseCost * targetProfitRate;
    
    // 固定成本
    const fixedCost = purchaseCost + shippingFee + labelFee;

    // 尝试每个佣金挡位，找到符合条件的售价
    for (let tier = 0; tier < 3; tier++) {
      const commissionRate = commissionRates[tier];
      
      // 售价 = 固定成本 + 佣金 + 杂费 + 利润
      // 售价 = fixedCost + 售价*commissionRate + 售价*miscRate + targetProfit
      // 售价 * (1 - commissionRate - miscRate) = fixedCost + targetProfit
      // 售价 = (fixedCost + targetProfit) / (1 - commissionRate - miscRate)
      
      const denominator = 1 - commissionRate - miscRate;
      if (denominator <= 0) continue;
      
      const price = (fixedCost + targetProfit) / denominator;
      const priceRUB = price * exchangeRate;
      
      // 检查这个售价是否落在当前挡位
      const actualTier = this.getCommissionTier(priceRUB);
      if (actualTier === tier) {
        return price;
      }
    }

    // 如果没找到，使用最高挡位计算
    const commissionRate = commissionRates[2];
    const denominator = 1 - commissionRate - miscRate;
    if (denominator > 0) {
      return (fixedCost + targetProfit) / denominator;
    }

    return null;
  }

  /**
   * 根据卢布售价确定佣金挡位
   */
  getCommissionTier(priceRUB) {
    if (priceRUB <= 1500) return 0;
    if (priceRUB <= 5000) return 1;
    return 2;
  }

  /**
   * 解析佣金比例字符串
   */
  parseCommissionRate(commission) {
    if (typeof commission === 'number') return commission;
    const match = String(commission).match(/([\d.]+)/);
    if (match) {
      return parseFloat(match[1]) / 100;
    }
    return 0;
  }
}
