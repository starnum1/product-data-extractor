export class ExtractionStrategy {
  extractDimensions(extractor) {
    // 策略1: 从span元素提取
    let result = extractor.extractFromSpans();
    if (result) return result;

    // 策略2: 使用XPath提取
    result = extractor.extractFromXPath();
    if (result) return result;

    // 策略3: 全局搜索
    result = extractor.extractFromBody();
    return result;
  }

  extractWeight(extractor) {
    // 策略1: 从span元素提取
    let result = extractor.extractFromSpans();
    if (result) return result;

    // 策略2: 使用XPath提取
    result = extractor.extractFromXPath();
    if (result) return result;

    // 策略3: 全局搜索
    result = extractor.extractFromBody();
    return result;
  }
}
