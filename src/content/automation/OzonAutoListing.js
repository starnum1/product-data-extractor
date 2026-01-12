/**
 * OZON 自动上架 - 自动化操作毛子ERP
 */
export class OzonAutoListing {
  constructor() {
    // 毛子ERP 的选择器
    this.selectors = {
      // 一键上架按钮 - Ant Design 危险按钮，包含闪电图标
      oneClickListBtn: 'button.ant-btn-dangerous .anticon-thunderbolt',
      // 显示所有SKU 开关
      showAllSkuSwitch: '.ant-switch',
    };
  }

  /**
   * 获取毛子ERP的Shadow DOM根节点
   */
  getMaoziShadowRoot() {
    const maoziEl = document.querySelector('maozierp-ui');
    return maoziEl?.shadowRoot || null;
  }

  /**
   * 等待元素出现
   */
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
      // 先检查元素是否已存在
      const existing = document.querySelector(selector);
      if (existing) {
        return resolve(existing);
      }

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        // 超时前再检查一次
        resolve(document.querySelector(selector));
      }, timeout);
    });
  }

  /**
   * 点击一键上架按钮
   */
  async clickOneClickList() {
    const shadowRoot = this.getMaoziShadowRoot();
    const searchRoot = shadowRoot || document;

    // 方法1: 通过闪电图标找到按钮
    const thunderboltIcon = searchRoot.querySelector(this.selectors.oneClickListBtn);
    if (thunderboltIcon) {
      const btn = thunderboltIcon.closest('button');
      if (btn && btn.textContent.includes('一键上架')) {
        console.log('找到一键上架按钮:', btn);
        btn.click();
        return { success: true, message: '已点击一键上架' };
      }
    }

    // 方法2: 遍历所有 ant-btn-dangerous 按钮
    const dangerBtns = searchRoot.querySelectorAll('button.ant-btn-dangerous');
    for (const btn of dangerBtns) {
      if (btn.textContent.includes('一键上架') && !btn.textContent.includes('至')) {
        console.log('找到一键上架按钮:', btn);
        btn.click();
        return { success: true, message: '已点击一键上架' };
      }
    }

    return { success: false, message: '未找到一键上架按钮，请确保毛子ERP面板已打开' };
  }

  /**
   * 点击显示所有SKU开关（切换为否）
   */
  async clickShowAllSkuSwitch() {
    const shadowRoot = this.getMaoziShadowRoot();
    if (!shadowRoot) {
      return { success: false, message: '未找到毛子ERP Shadow DOM' };
    }

    // 在Shadow DOM中找到弹窗
    const modal = shadowRoot.querySelector('.ant-modal-content');
    if (!modal) {
      return { success: false, message: '弹窗未找到' };
    }

    // 找到所有 span，查找包含"显示所有SKU"的
    const spans = modal.querySelectorAll('span');
    for (const span of spans) {
      if (span.textContent.includes('显示所有SKU')) {
        // 找到同级的开关按钮
        const parent = span.closest('.flex');
        const switchBtn = parent?.querySelector('button[role="switch"]');
        
        if (switchBtn) {
          // 只有当开关是开启状态（checked）时才点击
          if (switchBtn.classList.contains('ant-switch-checked')) {
            console.log('找到显示所有SKU开关，点击切换为否:', switchBtn);
            switchBtn.click();
            return { success: true, message: '已切换显示所有SKU为否' };
          } else {
            return { success: true, message: '显示所有SKU已经是否' };
          }
        }
      }
    }

    return { success: false, message: '未找到显示所有SKU开关' };
  }

  /**
   * 填入售价到输入框
   */
  async fillPrice(price) {
    const shadowRoot = this.getMaoziShadowRoot();
    if (!shadowRoot) {
      return { success: false, message: '未找到毛子ERP Shadow DOM' };
    }

    // 找到价格输入框 (id 为 form_item_rows_0_price)
    const priceInput = shadowRoot.querySelector('#form_item_rows_0_price');
    
    if (!priceInput) {
      return { success: false, message: '未找到售价输入框' };
    }

    // 设置值并触发事件（Ant Design 需要触发事件才能识别）
    priceInput.focus();
    priceInput.value = price;
    priceInput.dispatchEvent(new Event('input', { bubbles: true }));
    priceInput.dispatchEvent(new Event('change', { bubbles: true }));
    priceInput.blur();

    console.log('已填入售价:', price);
    return { success: true, message: `已填入售价 ¥${price}` };
  }

  /**
   * 点击一键上架至OZON按钮
   */
  async clickSubmitToOzon() {
    const shadowRoot = this.getMaoziShadowRoot();
    if (!shadowRoot) {
      return { success: false, message: '未找到毛子ERP Shadow DOM' };
    }

    // 找到"一键上架至OZON"按钮
    const buttons = shadowRoot.querySelectorAll('button.ant-btn-primary');
    for (const btn of buttons) {
      if (btn.textContent.includes('一键上架至OZON')) {
        console.log('找到一键上架至OZON按钮:', btn);
        btn.click();
        return { success: true, message: '已点击上架至OZON' };
      }
    }

    return { success: false, message: '未找到一键上架至OZON按钮' };
  }

  /**
   * 等待Shadow DOM中的元素出现
   */
  async waitForModalInShadow(timeout = 3000) {
    const interval = 100;
    let elapsed = 0;
    
    while (elapsed < timeout) {
      const shadowRoot = this.getMaoziShadowRoot();
      const modal = shadowRoot?.querySelector('.ant-modal-content');
      if (modal) return modal;
      
      await new Promise(r => setTimeout(r, interval));
      elapsed += interval;
    }
    return null;
  }

  /**
   * 执行完整的上架流程
   * @param {number|string} price - 要填入的售价（人民币）
   */
  async executeListingFlow(price) {
    // 步骤1: 点击一键上架
    const step1 = await this.clickOneClickList();
    if (!step1.success) return step1;

    // 等待弹窗出现（轮询检测，最多3秒）
    const modal = await this.waitForModalInShadow(3000);
    
    if (!modal) {
      return { success: false, message: '弹窗未找到' };
    }
    
    // 短暂等待渲染完成
    await new Promise(r => setTimeout(r, 200));

    // 步骤2: 点击显示所有SKU开关
    const step2 = await this.clickShowAllSkuSwitch();
    if (!step2.success) return step2;

    // 步骤3: 填入售价
    if (!price) {
      return { success: false, message: '请先计算目标售价' };
    }
    
    await new Promise(r => setTimeout(r, 200));
    const step3 = await this.fillPrice(price);
    if (!step3.success) return step3;

    // 步骤4: 点击上架至OZON
    await new Promise(r => setTimeout(r, 200));
    const step4 = await this.clickSubmitToOzon();
    
    return {
      success: step4.success,
      message: `${step1.message} → ${step2.message} → ${step3.message} → ${step4.message}`
    };
  }
}

// 创建全局实例
window.ozonAutoListing = new OzonAutoListing();
