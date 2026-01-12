import panelHtml from './panel.html?raw';
import panelCss from './panel.css?raw';
import { ProfitCalculator } from '../calculators/ProfitCalculator.js';
import { OzonAutoListing } from '../automation/OzonAutoListing.js';

/**
 * 浮动面板 - 可拖动的数据提取面板
 */
export class FloatingPanel {
  constructor(extractor) {
    this.extractor = extractor;
    this.profitCalculator = new ProfitCalculator();
    this.autoListing = new OzonAutoListing();
    this.panel = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.currentData = null;
  }

  toggle() {
    if (this.panel) {
      this.panel.style.display = this.panel.style.display === 'none' ? 'block' : 'none';
    } else {
      this.create();
    }
  }

  create() {
    // 注入样式
    this.injectStyles();

    // 创建面板容器
    this.panel = document.createElement('div');
    this.panel.id = 'product-extractor-panel';
    this.panel.innerHTML = panelHtml;
    document.body.appendChild(this.panel);

    // 绑定事件
    this.bindEvents();
  }

  injectStyles() {
    if (document.getElementById('pep-styles')) return;
    const style = document.createElement('style');
    style.id = 'pep-styles';
    style.textContent = panelCss;
    document.head.appendChild(style);
  }

  bindEvents() {
    const header = this.panel.querySelector('.pep-header');
    const closeBtn = this.panel.querySelector('.pep-btn-close');
    const minimizeBtn = this.panel.querySelector('.pep-btn-minimize');
    const extractBtn = this.panel.querySelector('.pep-btn-extract');
    const recalculateBtn = this.panel.querySelector('.pep-btn-recalculate');
    const copyBtn = this.panel.querySelector('.pep-btn-copy');
    const clearBtn = this.panel.querySelector('.pep-btn-clear');
    const calcProfitBtn = this.panel.querySelector('.pep-btn-calc-profit');

    // 拖动
    header.addEventListener('mousedown', (e) => this.startDrag(e));
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', () => this.endDrag());

    // 按钮事件
    closeBtn.addEventListener('click', () => (this.panel.style.display = 'none'));
    minimizeBtn.addEventListener('click', () => this.toggleMinimize());
    extractBtn.addEventListener('click', () => this.handleExtract());
    recalculateBtn.addEventListener('click', () => this.handleRecalculate());
    copyBtn.addEventListener('click', () => this.handleCopy());
    clearBtn.addEventListener('click', () => this.handleClear());
    calcProfitBtn.addEventListener('click', () => this.handleCalcProfit());
  }

  startDrag(e) {
    if (e.target.tagName === 'BUTTON') return;
    this.isDragging = true;
    const rect = this.panel.getBoundingClientRect();
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    this.panel.style.cursor = 'grabbing';
  }

  drag(e) {
    if (!this.isDragging) return;
    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;
    this.panel.style.left = `${x}px`;
    this.panel.style.top = `${y}px`;
    this.panel.style.right = 'auto';
  }

  endDrag() {
    this.isDragging = false;
    if (this.panel) {
      this.panel.style.cursor = '';
    }
  }

  toggleMinimize() {
    const body = this.panel.querySelector('.pep-body');
    const btn = this.panel.querySelector('.pep-btn-minimize');
    if (body.style.display === 'none') {
      body.style.display = 'block';
      btn.textContent = '−';
    } else {
      body.style.display = 'none';
      btn.textContent = '+';
    }
  }

  async handleExtract() {
    const btn = this.panel.querySelector('.pep-btn-extract');
    btn.disabled = true;
    btn.textContent = '⏳ 提取中...';

    try {
      const data = await this.extractor.extract();
      this.currentData = data;

      if (data.success) {
        this.renderResults(data);
        this.showMessage('✓ 数据提取成功！', 'success');
      } else {
        this.showMessage(data.error || '提取失败', 'error');
      }
    } catch (error) {
      this.showMessage('提取失败: ' + error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '🚀 提取数据';
    }
  }

  renderResults(data) {
    this.panel.querySelector('.pep-empty-state').style.display = 'none';
    this.panel.querySelector('.pep-results').style.display = 'block';

    // 尺寸
    const dimContainer = this.panel.querySelector('.pep-dimensions-data');
    if (data.dimensions) {
      const { length, width, height, unit, raw } = data.dimensions;
      dimContainer.innerHTML = `
        <div class="pep-data-item"><span>长度</span><span>${length} ${unit}</span></div>
        <div class="pep-data-item"><span>宽度</span><span>${width} ${unit}</span></div>
        <div class="pep-data-item"><span>高度</span><span>${height} ${unit}</span></div>
        <div class="pep-data-item"><span>完整</span><span>${raw}</span></div>
      `;
    } else {
      dimContainer.innerHTML = '<div class="pep-data-item"><span>未找到尺寸数据</span></div>';
    }

    // 重量
    const weightContainer = this.panel.querySelector('.pep-weight-data');
    if (data.weight) {
      weightContainer.innerHTML = `
        <div class="pep-data-item"><span>重量</span><span>${data.weight.value} ${data.weight.unit}</span></div>
      `;
      this.panel.querySelector('.pep-custom-weight').placeholder = `默认: ${data.weight.value}`;
    } else {
      weightContainer.innerHTML = '<div class="pep-data-item"><span>未找到重量数据</span></div>';
    }

    // 佣金
    const commContainer = this.panel.querySelector('.pep-commission-data');
    if (data.commission?.commissions?.length) {
      commContainer.innerHTML = data.commission.commissions
        .map((rate) => `<div class="pep-data-item"><span>佣金</span><span>${rate}</span></div>`)
        .join('');
    } else {
      commContainer.innerHTML = '<div class="pep-data-item"><span>未找到佣金数据</span></div>';
    }

    // 价格
    const priceContainer = this.panel.querySelector('.pep-price-data');
    if (data.price) {
      priceContainer.innerHTML = `
        <div class="pep-data-item"><span>绿标 (CNY)</span><span class="pep-price-green">${data.price.greenPrice || '-'}</span></div>
        <div class="pep-data-item"><span>灰标 (CNY)</span><span>${data.price.grayPrice || '-'}</span></div>
        <div class="pep-data-item"><span>绿标 (RUB)</span><span>${data.price.greenPriceRUB || '-'}</span></div>
        <div class="pep-data-item"><span>灰标 (RUB)</span><span>${data.price.grayPriceRUB || '-'}</span></div>
      `;
    }

    // 汇率
    const rateContainer = this.panel.querySelector('.pep-rate-data');
    if (data.price?.exchangeRate) {
      rateContainer.innerHTML = `
        <div class="pep-data-item"><span>当前汇率</span><span>1 CNY = ${data.price.exchangeRate.toFixed(4)} RUB</span></div>
      `;
      this.panel.querySelector('.pep-custom-rate').placeholder =
        `默认: ${data.price.exchangeRate.toFixed(4)}`;
    }

    // 运费
    this.renderShipping(data.shipping);
  }

  renderShipping(shipping) {
    const container = this.panel.querySelector('.pep-shipping-data');
    if (shipping?.success) {
      container.innerHTML = `
        <div class="pep-data-item pep-shipping-success"><span>运费</span><span class="pep-shipping-fee">${shipping.shippingFee} 元</span></div>
        <div class="pep-data-item"><span>渠道</span><span>${shipping.channel.channel_name}</span></div>
        <div class="pep-data-item"><span>时效</span><span>${shipping.channel.delivery_days}</span></div>
        <div class="pep-data-item"><span>公式</span><span>${shipping.details.formula}</span></div>
      `;
    } else {
      container.innerHTML = `
        <div class="pep-data-item pep-shipping-error"><span>计算失败</span><span>${shipping?.error || '无法计算'}</span></div>
      `;
    }
  }

  async handleRecalculate() {
    if (!this.currentData) {
      this.showMessage('请先提取数据', 'error');
      return;
    }

    const customWeight = this.panel.querySelector('.pep-custom-weight').value;
    const customRate = this.panel.querySelector('.pep-custom-rate').value;

    try {
      const result = await this.extractor.recalculateShipping(this.currentData, {
        customWeight: customWeight ? parseFloat(customWeight) : null,
        customRate: customRate ? parseFloat(customRate) : null,
      });

      if (result.shipping) {
        this.currentData.shipping = result.shipping;
        this.renderShipping(result.shipping);
      }
      if (result.price) {
        this.currentData.price = result.price;
        const priceContainer = this.panel.querySelector('.pep-price-data');
        priceContainer.innerHTML = `
          <div class="pep-data-item"><span>绿标 (CNY)</span><span class="pep-price-green">${result.price.greenPrice || '-'}</span></div>
          <div class="pep-data-item"><span>灰标 (CNY)</span><span>${result.price.grayPrice || '-'}</span></div>
          <div class="pep-data-item"><span>绿标 (RUB)</span><span>${result.price.greenPriceRUB || '-'}</span></div>
          <div class="pep-data-item"><span>灰标 (RUB)</span><span>${result.price.grayPriceRUB || '-'}</span></div>
        `;
      }
      this.showMessage('✓ 重新计算完成！', 'success');
    } catch (error) {
      this.showMessage('计算失败: ' + error.message, 'error');
    }
  }

  handleCopy() {
    if (!this.currentData) return;
    let text = '商品数据\n\n';
    if (this.currentData.dimensions) {
      const { length, width, height, unit } = this.currentData.dimensions;
      text += `尺寸: ${length} x ${width} x ${height} ${unit}\n`;
    }
    if (this.currentData.weight) {
      text += `重量: ${this.currentData.weight.value} ${this.currentData.weight.unit}\n`;
    }
    if (this.currentData.shipping?.success) {
      text += `运费: ${this.currentData.shipping.shippingFee} 元\n`;
      text += `渠道: ${this.currentData.shipping.channel.channel_name}\n`;
    }
    navigator.clipboard.writeText(text).then(() => {
      this.showMessage('✓ 已复制到剪贴板', 'success');
    });
  }

  handleClear() {
    this.currentData = null;
    this.panel.querySelector('.pep-results').style.display = 'none';
    this.panel.querySelector('.pep-empty-state').style.display = 'block';
    this.panel.querySelector('.pep-custom-weight').value = '';
    this.panel.querySelector('.pep-custom-rate').value = '';
    this.panel.querySelector('.pep-purchase-cost').value = '';
    this.panel.querySelector('.pep-profit-result').style.display = 'none';
    this.showMessage('', '');
  }

  handleCalcProfit() {
    if (!this.currentData) {
      this.showMessage('请先提取数据', 'error');
      return;
    }

    const purchaseCost = parseFloat(this.panel.querySelector('.pep-purchase-cost').value);
    const labelFee = parseFloat(this.panel.querySelector('.pep-label-fee').value) || 3;
    const miscRate = (parseFloat(this.panel.querySelector('.pep-misc-rate').value) || 3.9) / 100;

    // 获取用户输入的自定义重量，如果没有则使用原始重量
    const customWeight = this.panel.querySelector('.pep-custom-weight').value;
    const weightG = customWeight 
      ? parseFloat(customWeight) 
      : this.extractWeightInGrams(this.currentData.weight);

    // 获取初始运费（用绿标价格计算的运费）
    const initialShippingFee = this.currentData.shipping?.success
      ? parseFloat(this.currentData.shipping.shippingFee)
      : null;

    // 获取佣金
    const commissions = this.currentData.commission?.commissions;

    // 获取汇率
    const exchangeRate = this.currentData.price?.exchangeRate;

    // 获取尺寸（用于重新计算运费）
    const dimensions = this.extractDimensionsInCm(this.currentData.dimensions);

    const result = this.profitCalculator.calculate({
      purchaseCost,
      initialShippingFee,
      commissions,
      exchangeRate,
      dimensions,
      weightG,
      labelFee,
      miscRate,
    });

    this.renderProfitResult(result);
  }

  /**
   * 提取尺寸（转换为厘米）
   */
  extractDimensionsInCm(dimensions) {
    if (!dimensions) return null;
    if (typeof dimensions === 'object' && dimensions.length && dimensions.width && dimensions.height) {
      let length = parseFloat(dimensions.length);
      let width = parseFloat(dimensions.width);
      let height = parseFloat(dimensions.height);
      const unit = (dimensions.unit || 'cm').toLowerCase();
      if (unit === 'mm' || unit === 'мм') {
        length = length / 10;
        width = width / 10;
        height = height / 10;
      }
      return { length, width, height };
    }
    return null;
  }

  /**
   * 提取重量（转换为克）
   */
  extractWeightInGrams(weight) {
    if (!weight) return null;
    if (typeof weight === 'object' && weight.value) {
      const value = parseFloat(weight.value);
      const unit = (weight.unit || 'g').toLowerCase();
      if (unit === 'kg' || unit === 'кг' || unit === '千克') {
        return value * 1000;
      }
      return value;
    }
    return null;
  }

  renderProfitResult(result) {
    const container = this.panel.querySelector('.pep-profit-result');
    
    if (!result.success) {
      container.style.display = 'block';
      container.innerHTML = `
        <div class="pep-data-item pep-shipping-error">
          <span>计算失败</span>
          <span>${result.error}</span>
        </div>
      `;
      return;
    }

    // 运费变化提示
    const shippingChangeHtml = result.shippingChanged ? `
      <div class="pep-data-item" style="background: #fff3e0; border-left: 3px solid #ff9800;">
        <span>⚠️ 运费已调整</span>
        <span>${result.initialShippingFee} → ${result.shippingFee} ¥</span>
      </div>
    ` : '';

    container.style.display = 'block';
    container.innerHTML = `
      <div class="pep-target-price">
        <div class="pep-target-price-label">建议售价</div>
        <div class="pep-target-price-value">${result.targetPriceCNY} ¥</div>
        <div class="pep-target-price-rub">${result.targetPriceRUB} ₽</div>
      </div>
      
      <button class="pep-btn-auto-list">⚡ 一键上架</button>
      
      ${shippingChangeHtml}
      
      <div class="pep-profit-info">
        <div class="pep-profit-info-item">
          <div class="pep-profit-info-label">利润</div>
          <div class="pep-profit-info-value profit">${result.profit} ¥</div>
        </div>
        <div class="pep-profit-info-item">
          <div class="pep-profit-info-label">利润率</div>
          <div class="pep-profit-info-value profit">${result.profitRate}</div>
        </div>
      </div>

      <div class="pep-data-item">
        <span>佣金挡位</span>
        <span>第${result.commissionTier}挡 (${result.commissionRate})</span>
      </div>

      <div class="pep-breakdown">
        <div class="pep-breakdown-title">费用明细</div>
        <div class="pep-breakdown-item">
          <span>采购成本</span>
          <span>${result.breakdown.purchaseCost} ¥</span>
        </div>
        <div class="pep-breakdown-item">
          <span>国际运费</span>
          <span>${result.breakdown.shippingFee} ¥</span>
        </div>
        <div class="pep-breakdown-item">
          <span>贴单费</span>
          <span>${result.breakdown.labelFee} ¥</span>
        </div>
        <div class="pep-breakdown-item">
          <span>平台佣金</span>
          <span>${result.breakdown.commission} ¥</span>
        </div>
        <div class="pep-breakdown-item">
          <span>杂费 (3.9%)</span>
          <span>${result.breakdown.miscFee} ¥</span>
        </div>
        <div class="pep-breakdown-item total">
          <span>总成本</span>
          <span>${result.breakdown.totalCost} ¥</span>
        </div>
      </div>
      
      <div class="pep-data-item" style="margin-top: 8px; font-size: 11px; color: #888;">
        <span>目标利润率</span>
        <span>${result.breakdown.targetProfitRate}</span>
      </div>
    `;

    // 绑定一键上架按钮事件
    const autoListBtn = container.querySelector('.pep-btn-auto-list');
    if (autoListBtn) {
      autoListBtn.addEventListener('click', () => this.handleAutoList());
    }
  }

  /**
   * 处理自动上架测试
   */
  async handleAutoList() {
    const btn = this.panel.querySelector('.pep-btn-auto-list');
    
    btn.disabled = true;
    btn.textContent = '⏳ 执行中...';

    try {
      // 获取计算好的售价（人民币）
      const priceEl = this.panel.querySelector('.pep-target-price-value');
      const price = priceEl ? parseFloat(priceEl.textContent) : null;
      
      if (!price) {
        this.showMessage('请先计算目标售价', 'error');
        return;
      }

      const result = await this.autoListing.executeListingFlow(price);
      
      if (result.success) {
        this.showMessage('✓ ' + result.message, 'success');
      } else {
        this.showMessage('✗ ' + result.message, 'error');
      }
    } catch (error) {
      this.showMessage('✗ 错误: ' + error.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '⚡ 一键上架';
    }
  }

  showMessage(text, type) {
    const msg = this.panel.querySelector('.pep-message');
    msg.textContent = text;
    msg.className = 'pep-message' + (type ? ` pep-message-${type}` : '');
  }
}
