import { DataExtractor } from './extractors/DataExtractor.js';
import { DOMObserver } from './utils/DOMObserver.js';

// 初始化数据提取器
const extractor = new DataExtractor();

// 缓存最近一次提取的数据
let lastExtractedData = null;

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
