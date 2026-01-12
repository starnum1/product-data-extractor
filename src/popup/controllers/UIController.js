import { MessageHandler } from '../utils/MessageHandler.js';
import { DataRenderer } from '../utils/DataRenderer.js';

export class UIController {
  constructor(dataService) {
    this.dataService = dataService;
    this.messageHandler = new MessageHandler();
    this.dataRenderer = new DataRenderer();
    this.currentData = null;

    this.elements = {
      extractBtn: document.getElementById('extractBtn'),
      resultSection: document.getElementById('resultSection'),
      emptyState: document.getElementById('emptyState'),
      dimensionsData: document.getElementById('dimensionsData'),
      weightData: document.getElementById('weightData'),
      commissionData: document.getElementById('commissionData'),
      priceData: document.getElementById('priceData'),
      exchangeRateData: document.getElementById('exchangeRateData'),
      shippingData: document.getElementById('shippingData'),
      messageDiv: document.getElementById('message'),
      copyAllBtn: document.getElementById('copyAllBtn'),
      clearBtn: document.getElementById('clearBtn'),
      customWeight: document.getElementById('customWeight'),
      customRate: document.getElementById('customRate'),
      recalculateBtn: document.getElementById('recalculateBtn'),
    };
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.elements.extractBtn.addEventListener('click', () => this.handleExtract());
    this.elements.copyAllBtn.addEventListener('click', () => this.handleCopyAll());
    this.elements.clearBtn.addEventListener('click', () => this.handleClear());
    this.elements.recalculateBtn.addEventListener('click', () => this.handleRecalculate());
  }

  async handleExtract() {
    this.setExtractingState(true);
    this.messageHandler.clear(this.elements.messageDiv);

    try {
      const response = await this.dataService.extractData();

      if (response && response.success) {
        this.currentData = response;
        this.dataRenderer.render(response, this.elements);
        
        // 设置默认值到输入框
        if (response.weight?.value) {
          this.elements.customWeight.placeholder = `默认: ${response.weight.value} ${response.weight.unit}`;
        }
        if (response.price?.exchangeRate) {
          this.elements.customRate.placeholder = `默认: ${response.price.exchangeRate.toFixed(4)}`;
        }
        
        this.messageHandler.showSuccess('✓ 数据提取成功！', this.elements.messageDiv);
      } else {
        this.messageHandler.showError(
          response?.error || '未找到数据，请确保数据卡片已加载',
          this.elements.messageDiv
        );
      }
    } catch (error) {
      this.messageHandler.showError('提取失败: ' + error.message, this.elements.messageDiv);
    } finally {
      this.setExtractingState(false);
    }
  }

  async handleRecalculate() {
    if (!this.currentData) {
      this.messageHandler.showError('请先提取数据', this.elements.messageDiv);
      return;
    }

    // 获取用户输入的自定义值
    const customWeight = this.elements.customWeight.value;
    const customRate = this.elements.customRate.value;

    try {
      const response = await this.dataService.recalculateShipping({
        customWeight: customWeight ? parseFloat(customWeight) : null,
        customRate: customRate ? parseFloat(customRate) : null,
      });

      if (response && response.shipping) {
        this.currentData.shipping = response.shipping;
        this.dataRenderer.renderShipping(response.shipping, this.elements.shippingData);
        
        // 如果使用了自定义汇率，更新价格显示
        if (response.price) {
          this.currentData.price = response.price;
          this.dataRenderer.renderPrice(response.price, this.elements.priceData);
          this.dataRenderer.renderExchangeRate(response.price.exchangeRate, this.elements.exchangeRateData);
        }
        
        this.messageHandler.showSuccess('✓ 运费重新计算完成！', this.elements.messageDiv);
      }
    } catch (error) {
      this.messageHandler.showError('计算失败: ' + error.message, this.elements.messageDiv);
    }
  }

  handleCopyAll() {
    if (!this.currentData) return;

    let text = '商品数据\n\n';

    if (this.currentData.dimensions) {
      const { length, width, height, unit } = this.currentData.dimensions;
      text += `尺寸信息:\n`;
      text += `长度: ${length} ${unit}\n`;
      text += `宽度: ${width} ${unit}\n`;
      text += `高度: ${height} ${unit}\n`;
      text += `完整: ${length} x ${width} x ${height} ${unit}\n\n`;
    }

    if (this.currentData.weight) {
      const { value, unit } = this.currentData.weight;
      text += `重量信息:\n`;
      text += `重量: ${value} ${unit}\n\n`;
    }

    if (this.currentData.commission && this.currentData.commission.commissions) {
      text += `佣金信息:\n`;
      text += `佣金比例: ${this.currentData.commission.commissions.join(', ')}\n`;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.messageHandler.showSuccess('✓ 已复制到剪贴板', this.elements.messageDiv);
      })
      .catch(() => {
        this.messageHandler.showError('复制失败', this.elements.messageDiv);
      });
  }

  handleClear() {
    this.currentData = null;
    this.elements.resultSection.classList.remove('show');
    this.elements.emptyState.style.display = 'block';
    this.messageHandler.clear(this.elements.messageDiv);
  }

  setExtractingState(isExtracting) {
    this.elements.extractBtn.disabled = isExtracting;
    this.elements.extractBtn.innerHTML = isExtracting
      ? '<span class="loading"></span> 正在提取...'
      : '🚀 提取数据';
  }
}
