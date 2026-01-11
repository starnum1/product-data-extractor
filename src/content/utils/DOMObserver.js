export class DOMObserver {
  constructor() {
    this.observer = null;
  }

  start() {
    this.observer = new MutationObserver((mutations) => {
      const hasDataCard =
        document.body.textContent.includes('长 宽 高') ||
        document.body.textContent.includes('重 量');

      if (hasDataCard) {
        console.log('数据卡片已加载');
        this.stop();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
