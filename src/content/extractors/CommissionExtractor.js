export class CommissionExtractor {
  extract() {
    const result = {
      commissions: [],
      raw: null,
    };

    try {
      // 策略1: 查找包含"佣金"关键词的span元素
      const spans = document.querySelectorAll('span');
      
      for (let span of spans) {
        const text = span.textContent.trim();
        
        // 匹配包含"佣金"的文本
        if (text.includes('佣金') || text.includes('rFBS佣金')) {
          // 查找父元素或兄弟元素中的百分比数据
          let targetElement = span.parentElement;
          
          if (targetElement) {
            // 查找所有包含百分比的标签
            const percentTags = targetElement.querySelectorAll('.ant-tag, [class*="tag"]');
            
            if (percentTags.length > 0) {
              percentTags.forEach(tag => {
                const percentMatch = tag.textContent.match(/(\d+(?:\.\d+)?)%/);
                if (percentMatch) {
                  result.commissions.push(percentMatch[1] + '%');
                }
              });
            } else {
              // 如果没有找到标签，尝试从文本中提取
              const percentMatches = targetElement.textContent.matchAll(/(\d+(?:\.\d+)?)%/g);
              for (let match of percentMatches) {
                result.commissions.push(match[1] + '%');
              }
            }
            
            if (result.commissions.length > 0) {
              result.raw = result.commissions.join(', ');
              break;
            }
          }
        }
      }

      // 策略2: 使用XPath查找包含"佣金"的文本节点
      if (result.commissions.length === 0) {
        const xpath = "//text()[contains(., '佣金') or contains(., 'rFBS')]";
        const textNodes = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );

        for (let i = 0; i < textNodes.snapshotLength; i++) {
          const node = textNodes.snapshotItem(i);
          const parentElement = node.parentElement;

          if (parentElement) {
            const percentMatches = parentElement.textContent.matchAll(/(\d+(?:\.\d+)?)%/g);
            for (let match of percentMatches) {
              result.commissions.push(match[1] + '%');
            }

            if (result.commissions.length > 0) {
              result.raw = result.commissions.join(', ');
              break;
            }
          }
        }
      }

      // 去重
      if (result.commissions.length > 0) {
        result.commissions = [...new Set(result.commissions)];
        result.raw = result.commissions.join(', ');
      }

    } catch (error) {
      console.error('佣金提取错误:', error);
    }

    return result.commissions.length > 0 ? result : null;
  }
}
