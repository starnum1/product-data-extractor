export class DataRenderer {
  render(data, elements) {
    elements.emptyState.style.display = 'none';
    elements.resultSection.classList.add('show');

    this.renderDimensions(data.dimensions, elements.dimensionsData);
    this.renderWeight(data.weight, elements.weightData);
    this.renderCommission(data.commission, elements.commissionData);
    this.renderPrice(data.price, elements.priceData);
    this.renderExchangeRate(data.price?.exchangeRate, elements.exchangeRateData);
    this.renderShipping(data.shipping, elements.shippingData);
  }

  renderDimensions(dimensions, container) {
    if (dimensions) {
      const { length, width, height, unit, raw } = dimensions;
      container.innerHTML = `
        <div class="data-item">
          <span class="data-label">长度</span>
          <span class="data-value">${length} ${unit}</span>
        </div>
        <div class="data-item">
          <span class="data-label">宽度</span>
          <span class="data-value">${width} ${unit}</span>
        </div>
        <div class="data-item">
          <span class="data-label">高度</span>
          <span class="data-value">${height} ${unit}</span>
        </div>
        <div class="data-item">
          <span class="data-label">完整尺寸</span>
          <span class="data-value">${raw}</span>
        </div>
      `;
    } else {
      container.innerHTML =
        '<div class="data-item"><span class="data-label">未找到尺寸数据</span></div>';
    }
  }

  renderWeight(weight, container) {
    if (weight) {
      const { value, unit, raw } = weight;
      container.innerHTML = `
        <div class="data-item">
          <span class="data-label">重量</span>
          <span class="data-value">${value} ${unit}</span>
        </div>
        <div class="data-item">
          <span class="data-label">原始数据</span>
          <span class="data-value">${raw}</span>
        </div>
      `;
    } else {
      container.innerHTML =
        '<div class="data-item"><span class="data-label">未找到重量数据</span></div>';
    }
  }

  renderCommission(commission, container) {
    if (commission && commission.commissions && commission.commissions.length > 0) {
      const commissionsHtml = commission.commissions
        .map(
          (rate) => `
        <div class="data-item">
          <span class="data-label">佣金比例</span>
          <span class="data-value">${rate}</span>
        </div>
      `
        )
        .join('');

      container.innerHTML = commissionsHtml;
    } else {
      container.innerHTML =
        '<div class="data-item"><span class="data-label">未找到佣金数据</span></div>';
    }
  }

  renderPrice(price, container) {
    if (!container) return;
    
    if (price) {
      container.innerHTML = `
        <div class="data-item">
          <span class="data-label">绿标价格 (CNY)</span>
          <span class="data-value price-green">${price.greenPrice || '-'}</span>
        </div>
        <div class="data-item">
          <span class="data-label">灰标价格 (CNY)</span>
          <span class="data-value price-gray">${price.grayPrice || '-'}</span>
        </div>
        <div class="data-item">
          <span class="data-label">绿标价格 (RUB)</span>
          <span class="data-value">${price.greenPriceRUB || '-'}</span>
        </div>
        <div class="data-item">
          <span class="data-label">灰标价格 (RUB)</span>
          <span class="data-value">${price.grayPriceRUB || '-'}</span>
        </div>
      `;
    } else {
      container.innerHTML =
        '<div class="data-item"><span class="data-label">未找到价格数据</span></div>';
    }
  }

  renderExchangeRate(rate, container) {
    if (!container) return;
    
    if (rate) {
      container.innerHTML = `
        <div class="data-item">
          <span class="data-label">当前汇率</span>
          <span class="data-value">1 CNY = ${rate.toFixed(4)} RUB</span>
        </div>
      `;
    } else {
      container.innerHTML =
        '<div class="data-item"><span class="data-label">未获取汇率</span></div>';
    }
  }

  renderShipping(shipping, container) {
    if (!container) return;
    
    if (shipping && shipping.success) {
      const { channel, shippingFee, details } = shipping;
      container.innerHTML = `
        <div class="data-item shipping-success">
          <span class="data-label">运费</span>
          <span class="data-value shipping-fee">${shippingFee} 元</span>
        </div>
        <div class="data-item">
          <span class="data-label">渠道</span>
          <span class="data-value">${channel.channel_name}</span>
        </div>
        <div class="data-item">
          <span class="data-label">时效</span>
          <span class="data-value">${channel.delivery_days}</span>
        </div>
        <div class="data-item">
          <span class="data-label">计算公式</span>
          <span class="data-value">${details.formula}</span>
        </div>
      `;
    } else if (shipping && shipping.error) {
      container.innerHTML = `
        <div class="data-item shipping-error">
          <span class="data-label">计算失败</span>
          <span class="data-value">${shipping.error}</span>
        </div>
      `;
    } else {
      container.innerHTML =
        '<div class="data-item"><span class="data-label">无法计算运费</span></div>';
    }
  }
}
