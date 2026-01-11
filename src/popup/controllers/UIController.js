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
      messageDiv: document.getElementById('message'),
      copyAllBtn: document.getElementById('copyAllBtn'),
      clearBtn: document.getElementById('clearBtn'),
    };
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.elements.extractBtn.addEventListener('click', () => this.handleExtract());
    this.elements.copyAllBtn.addEventListener('click', () => this.handleCopyAll());
    this.elements.clearBtn.addEventListener('click', () => this.handleClear());
  }

  async handleExtract() {
    this.setExtractingState(true);
    this.messageHandler.clear(this.elements.messageDiv);

    try {
      const response = await this.dataService.extractData();

      if (response && response.success) {
        this.currentData = response;
        this.dataRenderer.render(response, this.elements);
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
      text += `重量: ${value} ${unit}\n`;
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
