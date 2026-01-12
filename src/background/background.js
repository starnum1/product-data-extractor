// 点击扩展图标时，向当前页面发送消息切换浮动面板
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
  } catch (error) {
    // 如果 content script 还没加载，先注入
    console.log('Content script not ready, injecting...');
  }
});
