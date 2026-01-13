import { DataExtractor } from './extractors/DataExtractor.js';
import { DOMObserver } from './utils/DOMObserver.js';
import { FloatingPanel } from './ui/FloatingPanel.js';

// 初始化数据提取器
const extractor = new DataExtractor();

// 初始化浮动面板并自动显示
const floatingPanel = new FloatingPanel(extractor);

// 页面加载完成后自动显示面板
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    floatingPanel.show();
  });
} else {
  // 如果页面已经加载完成，直接显示
  floatingPanel.show();
}

// 缓存最近一次提取的数据
let lastExtractedData = null;

// 监听来自popup和background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'togglePanel') {
    floatingPanel.toggle();
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'extractData') {
    // 异步处理
    extractor.extract().then((data) => {
      console.log('提取结果:', data);
      lastExtractedData = data;
      sendResponse(data);
    });
    return true; // 保持消息通道开放
  }

  if (request.action === 'recalculateShipping') {
    // 使用自定义值重新计算运费
    extractor
      .recalculateShipping(lastExtractedData, {
        customWeight: request.customWeight,
        customRate: request.customRate,
      })
      .then((result) => {
        console.log('重新计算结果:', result);
        sendResponse(result);
      });
    return true;
  }

  return true;
});

// 页面加载完成后启动DOM观察器
window.addEventListener('load', () => {
  const observer = new DOMObserver();
  observer.start();
});
