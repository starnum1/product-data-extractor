document.addEventListener('DOMContentLoaded', () => {
  const extractBtn = document.getElementById('extractBtn');
  const resultSection = document.getElementById('resultSection');
  const emptyState = document.getElementById('emptyState');
  const dimensionsData = document.getElementById('dimensionsData');
  const weightData = document.getElementById('weightData');
  const messageDiv = document.getElementById('message');
  const copyAllBtn = document.getElementById('copyAllBtn');
  const clearBtn = document.getElementById('clearBtn');

  let currentData = null;

  // 提取数据
  extractBtn.addEventListener('click', async () => {
    extractBtn.disabled = true;
    extractBtn.innerHTML = '<span class="loading"></span> 正在提取...';
    messageDiv.innerHTML = '';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      chrome.tabs.sendMessage(tab.id, { action: 'extractData' }, (response) => {
        extractBtn.disabled = false;
        extractBtn.innerHTML = '🚀 提取数据';

        if (chrome.runtime.lastError) {
          showError('无法连接到页面，请刷新页面后重试');
          return;
        }

        if (response && response.success) {
          currentData = response;
          displayData(response);
          showSuccess('✓ 数据提取成功！');
        } else {
          showError(response?.error || '未找到数据，请确保数据卡片已加载');
        }
      });
    } catch (error) {
      extractBtn.disabled = false;
      extractBtn.innerHTML = '🚀 提取数据';
      showError('提取失败: ' + error.message);
    }
  });

  // 显示数据
  function displayData(data) {
    emptyState.style.display = 'none';
    resultSection.classList.add('show');

    // 显示尺寸数据
    if (data.dimensions) {
      const { length, width, height, unit, raw } = data.dimensions;
      dimensionsData.innerHTML = `
        <div class="data-item">
          <span class="data-label">长度</span>
          <span class="data-value">${length} ${unit}</span>
        </div>
        <div class="data-item">
          <span class="data-label">宽度</span>
          <span class="data-value">${width} ${unit}</span>
        </div>
        <div class="data-item">
          <span class="data-label">高度</span>
          <span class="data-value">${height} ${unit}</span>
        </div>
        <div class="data-item">
          <span class="data-label">完整尺寸</span>
          <span class="data-value">${raw}</span>
        </div>
      `;
    } else {
      dimensionsData.innerHTML = '<div class="data-item"><span class="data-label">未找到尺寸数据</span></div>';
    }

    // 显示重量数据
    if (data.weight) {
      const { value, unit, raw } = data.weight;
      weightData.innerHTML = `
        <div class="data-item">
          <span class="data-label">重量</span>
          <span class="data-value">${value} ${unit}</span>
        </div>
        <div class="data-item">
          <span class="data-label">原始数据</span>
          <span class="data-value">${raw}</span>
        </div>
      `;
    } else {
      weightData.innerHTML = '<div class="data-item"><span class="data-label">未找到重量数据</span></div>';
    }
  }

  // 复制全部数据
  copyAllBtn.addEventListener('click', () => {
    if (!currentData) return;

    let text = '商品数据\n\n';
    
    if (currentData.dimensions) {
      const { length, width, height, unit } = currentData.dimensions;
      text += `尺寸信息:\n`;
      text += `长度: ${length} ${unit}\n`;
      text += `宽度: ${width} ${unit}\n`;
      text += `高度: ${height} ${unit}\n`;
      text += `完整: ${length} x ${width} x ${height} ${unit}\n\n`;
    }

    if (currentData.weight) {
      const { value, unit } = currentData.weight;
      text += `重量信息:\n`;
      text += `重量: ${value} ${unit}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      showSuccess('✓ 已复制到剪贴板');
    }).catch(() => {
      showError('复制失败');
    });
  });

  // 清除数据
  clearBtn.addEventListener('click', () => {
    currentData = null;
    resultSection.classList.remove('show');
    emptyState.style.display = 'block';
    messageDiv.innerHTML = '';
  });

  // 显示错误消息
  function showError(message) {
    messageDiv.innerHTML = `<div class="error-message">❌ ${message}</div>`;
    setTimeout(() => {
      messageDiv.innerHTML = '';
    }, 5000);
  }

  // 显示成功消息
  function showSuccess(message) {
    messageDiv.innerHTML = `<div class="success-message">${message}</div>`;
    setTimeout(() => {
      messageDiv.innerHTML = '';
    }, 3000);
  }
});
