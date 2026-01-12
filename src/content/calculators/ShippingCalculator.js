import { SHIPPING_CHANNELS } from '../config/shippingChannels.js';

/**
 * 运费计算器
 */
export class ShippingCalculator {
  constructor() {
    this.channels = SHIPPING_CHANNELS;
  }

  /**
   * 计算运费
   * @param {Object} params 计算参数
   * @param {number} params.priceRUB 商品价格（卢布）
   * @param {number} params.weightG 商品重量（克）
   * @param {Object} params.dimensions 商品尺寸 {length, width, height} (cm)
   * @returns {Object} 计算结果
   */
  calculate({ priceRUB, weightG, dimensions }) {
    const result = {
      success: false,
      channel: null,
      shippingFee: null,
      error: null,
      details: {},
    };

    // 验证输入
    if (!priceRUB || priceRUB <= 0) {
      result.error = '缺少有效的商品价格';
      return result;
    }
    if (!weightG || weightG <= 0) {
      result.error = '缺少有效的商品重量';
      return result;
    }
    if (!dimensions) {
      result.error = '缺少商品尺寸信息';
      return result;
    }

    // 计算尺寸数据
    const { length, width, height } = dimensions;
    const maxDimension = Math.max(length, width, height);
    const girth = length + width + height;

    result.details = {
      priceRUB,
      weightG,
      maxDimension,
      girth,
    };

    // 第一步：按价格筛选渠道
    const priceMatchedChannels = this.channels.filter(
      (ch) => priceRUB >= ch.min_value_rub && priceRUB <= ch.max_value_rub
    );

    if (priceMatchedChannels.length === 0) {
      result.error = `商品价格 ${priceRUB} 卢布不在任何渠道范围内`;
      return result;
    }

    // 第二步：按重量筛选渠道
    const weightMatchedChannels = priceMatchedChannels.filter(
      (ch) => weightG >= ch.min_weight_g && weightG <= ch.max_weight_g
    );

    if (weightMatchedChannels.length === 0) {
      result.error = `商品重量 ${weightG}g 不在价格区间对应的重量范围内`;
      return result;
    }

    // 第三步：检查尺寸限制
    const validChannels = weightMatchedChannels.filter(
      (ch) => maxDimension <= ch.max_dimension_cm && girth <= ch.max_girth_cm
    );

    if (validChannels.length === 0) {
      result.error = `商品尺寸超限：最大单边 ${maxDimension}cm，三边和 ${girth}cm`;
      return result;
    }

    // 选择最优渠道（运费最低）
    let bestChannel = null;
    let lowestFee = Infinity;

    for (const channel of validChannels) {
      const fee = this.calculateFee(channel, weightG);
      if (fee < lowestFee) {
        lowestFee = fee;
        bestChannel = channel;
      }
    }

    result.success = true;
    result.channel = bestChannel;
    result.shippingFee = lowestFee.toFixed(2);
    result.details.formula = `${bestChannel.pickup_base} + ${bestChannel.pickup_per_g} × ${weightG}`;

    return result;
  }

  /**
   * 计算运费
   */
  calculateFee(channel, weightG) {
    return channel.pickup_base + channel.pickup_per_g * weightG;
  }
}
