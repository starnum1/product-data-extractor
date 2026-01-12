export class DataService {
  async extractData() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id, { action: 'extractData' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error('无法连接到页面，请刷新页面后重试'));
          return;
        }
        resolve(response);
      });
    });
  }

  async recalculateShipping({ customWeight, customRate }) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        tab.id,
        {
          action: 'recalculateShipping',
          customWeight,
          customRate,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error('无法连接到页面，请刷新页面后重试'));
            return;
          }
          resolve(response);
        }
      );
    });
  }
}
