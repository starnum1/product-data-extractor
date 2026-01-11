// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractData') {
    const data = extractProductData();
    console.log('提取结果:', data); // 调试日志
    sendResponse(data);
  }
  return true;
});

// 提取商品数据的核心函数
function extractProductData() {
  const result = {
    success: false,
    dimensions: null,
    weight: null,
    allData: {},
    error: null,
    debug: [] // 添加调试信息
  };

  try {
    // 策略1: 精确查找包含关键词的span元素及其相邻元素
    const dimensionKeywords = ['长 宽 高', '长宽高', '尺寸', 'размер', 'dimensions', 'size'];
    const weightKeywords = ['重 量', '重量', 'вес', 'weight'];

    result.debug.push('开始策略1: 查找span元素');

    // 获取所有span元素
    const allSpans = document.querySelectorAll('span');
    result.debug.push(`找到 ${allSpans.length} 个span元素`);
    
    for (let span of allSpans) {
      const spanText = span.textContent.trim();
      
      // 查找尺寸数据
      if (!result.dimensions) {
        for (let keyword of dimensionKeywords) {
          if (spanText.includes(keyword)) {
            result.debug.push(`找到尺寸关键词: "${keyword}" 在文本: "${spanText}"`);
            // 找到关键词后，查找同级或父级元素中的数值
            let targetElement = span.parentElement;
            if (targetElement) {
              const fullText = targetElement.textContent;
              result.debug.push(`父元素文本: "${fullText}"`);
              const dimensionMatch = fullText.match(/(\d+)\s*[xX×]\s*(\d+)\s*[xX×]\s*(\d+)\s*(mm|cm|m|мм|см|м|inches?|in)?/i);
              if (dimensionMatch) {
                result.dimensions = {
                  length: dimensionMatch[1],
                  width: dimensionMatch[2],
                  height: dimensionMatch[3],
                  unit: dimensionMatch[4] || 'mm',
                  raw: dimensionMatch[0].trim()
                };
                result.debug.push(`✓ 成功提取尺寸: ${result.dimensions.raw}`);
                break;
              }
            }
          }
        }
      }

      // 查找重量数据
      if (!result.weight) {
        for (let keyword of weightKeywords) {
          if (spanText.includes(keyword)) {
            result.debug.push(`找到重量关键词: "${keyword}" 在文本: "${spanText}"`);
            // 找到关键词后，查找同级或父级元素中的数值
            let targetElement = span.parentElement;
            if (targetElement) {
              const fullText = targetElement.textContent;
              result.debug.push(`父元素文本: "${fullText}"`);
              // 匹配重量格式，排除其他数字
              const weightMatch = fullText.match(/(\d+\.?\d*)\s*(g|kg|кг|г|lb|oz|克|千克|公斤)/i);
              if (weightMatch) {
                result.weight = {
                  value: weightMatch[1],
                  unit: weightMatch[2],
                  raw: weightMatch[0].trim()
                };
                result.debug.push(`✓ 成功提取重量: ${result.weight.raw}`);
                break;
              }
            }
          }
        }
      }

      // 如果都找到了就退出循环
      if (result.dimensions && result.weight) {
        break;
      }
    }

    // 策略2: 使用XPath查找包含关键词的文本节点
    if (!result.dimensions || !result.weight) {
      result.debug.push('开始策略2: 使用XPath查找');
      const xpath = "//text()[contains(., '长 宽 高') or contains(., '重 量') or contains(., '尺寸') or contains(., '重量')]";
      const textNodes = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      result.debug.push(`XPath找到 ${textNodes.snapshotLength} 个文本节点`);
      
      for (let i = 0; i < textNodes.snapshotLength; i++) {
        const node = textNodes.snapshotItem(i);
        const parentElement = node.parentElement;
        
        if (!parentElement) continue;
        
        // 获取父元素及其兄弟元素的文本
        let contextText = parentElement.textContent;
        if (parentElement.parentElement) {
          contextText = parentElement.parentElement.textContent;
        }
        
        // 提取尺寸
        if (!result.dimensions && (node.textContent.includes('长 宽 高') || node.textContent.includes('尺寸'))) {
          const dimensionMatch = contextText.match(/(\d+)\s*[xX×]\s*(\d+)\s*[xX×]\s*(\d+)\s*(mm|cm|m|мм|см|м|inches?|in)?/i);
          if (dimensionMatch) {
            result.dimensions = {
              length: dimensionMatch[1],
              width: dimensionMatch[2],
              height: dimensionMatch[3],
              unit: dimensionMatch[4] || 'mm',
              raw: dimensionMatch[0].trim()
            };
            result.debug.push(`✓ XPath提取尺寸: ${result.dimensions.raw}`);
          }
        }
        
        // 提取重量
        if (!result.weight && (node.textContent.includes('重 量') || node.textContent.includes('重量'))) {
          const weightMatch = contextText.match(/(\d+\.?\d*)\s*(g|kg|кг|г|lb|oz|克|千克|公斤)/i);
          if (weightMatch) {
            result.weight = {
              value: weightMatch[1],
              unit: weightMatch[2],
              raw: weightMatch[0].trim()
            };
            result.debug.push(`✓ XPath提取重量: ${result.weight.raw}`);
          }
        }
      }
    }

    // 策略3: 全局搜索（兜底方案）
    if (!result.dimensions || !result.weight) {
      result.debug.push('开始策略3: 全局搜索');
      const bodyText = document.body.textContent;
      
      if (!result.dimensions) {
        const dimensionMatch = bodyText.match(/(\d+)\s*[xX×]\s*(\d+)\s*[xX×]\s*(\d+)\s*(mm|cm|m|мм|см|м|inches?|in)?/i);
        if (dimensionMatch) {
          result.dimensions = {
            length: dimensionMatch[1],
            width: dimensionMatch[2],
            height: dimensionMatch[3],
            unit: dimensionMatch[4] || 'mm',
            raw: dimensionMatch[0].trim()
          };
          result.debug.push(`✓ 全局搜索提取尺寸: ${result.dimensions.raw}`);
        }
      }
      
      if (!result.weight) {
        // 查找重量相关的上下文
        const weightContext = bodyText.match(/重\s*[量:][\s\S]{0,50}?(\d+\.?\d*)\s*(g|kg|кг|г|克|千克|公斤)/i);
        if (weightContext) {
          result.weight = {
            value: weightContext[1],
            unit: weightContext[2],
            raw: `${weightContext[1]}${weightContext[2]}`
          };
          result.debug.push(`✓ 全局搜索提取重量: ${result.weight.raw}`);
        }
      }
    }

    // 提取其他可见数据
    const dataPatterns = [
      { key: '商品卡浏览量', pattern: /商品卡浏览量[：:\s]*(\d+)/ },
      { key: '商品卡加购率', pattern: /商品卡加购率[：:\s]*([\d.]+%)/ },
      { key: '商品点击率', pattern: /商品点击率[：:\s]*([\d.]+%)/ },
      { key: '发货模式', pattern: /发货模式[：:\s]*(\w+)/ },
      { key: '退货取消率', pattern: /退货取消率[：:\s]*([\d.]+%)/ },
      { key: '上架时间', pattern: /上架时间[：:\s]*([\d\-]+)/ }
    ];

    const bodyText = document.body.textContent;
    dataPatterns.forEach(({ key, pattern }) => {
      const match = bodyText.match(pattern);
      if (match) {
        result.allData[key] = match[1];
      }
    });

    result.success = !!(result.dimensions || result.weight);
    
    if (!result.success) {
      result.error = '未找到尺寸或重量数据，请确保数据卡片已加载';
      result.debug.push('❌ 所有策略都未能提取到数据');
    } else {
      result.debug.push('✓ 数据提取成功');
    }

    // 输出调试信息到控制台
    console.log('=== 数据提取调试信息 ===');
    result.debug.forEach(msg => console.log(msg));
    console.log('=== 最终结果 ===');
    console.log('尺寸:', result.dimensions);
    console.log('重量:', result.weight);

  } catch (error) {
    result.error = error.message;
    result.debug.push(`❌ 错误: ${error.message}`);
    console.error('提取错误:', error);
  }

  return result;
}

// 页面加载完成后自动检测
window.addEventListener('load', () => {
  // 使用MutationObserver监听DOM变化，等待数据卡片加载
  const observer = new MutationObserver((mutations) => {
    // 检查是否有新的数据卡片出现
    const hasDataCard = document.body.textContent.includes('长 宽 高') || 
                        document.body.textContent.includes('重 量');
    
    if (hasDataCard) {
      // 数据卡片已加载，可以停止观察
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});
