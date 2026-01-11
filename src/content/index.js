import { DataExtractor } from './extractors/DataExtractor.js';
import { DOMObserver } from './utils/DOMObserver.js';

// 初始化数据提取器
const extractor = new DataExtractor();

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    const data = extractor.extract();
    console.log('提取结果:', data);
    sendResponse(data);
  }
  return true;
});

// 页面加载完成后启动DOM观察器
window.addEventListener('load', () => {
  const observer = new DOMObserver();
  observer.start();
});
