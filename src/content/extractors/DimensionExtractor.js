import { DIMENSION_KEYWORDS, DIMENSION_PATTERN } from '../config/patterns.js';

export class DimensionExtractor {
  constructor() {
    this.keywords = DIMENSION_KEYWORDS;
    this.pattern = DIMENSION_PATTERN;
  }

  extractFromSpans() {
    const allSpans = document.querySelectorAll('span');

    for (let span of allSpans) {
      const spanText = span.textContent.trim();

      for (let keyword of this.keywords) {
        if (spanText.includes(keyword)) {
          const targetElement = span.parentElement;
          if (targetElement) {
            const fullText = targetElement.textContent;
            const match = fullText.match(this.pattern);
            if (match) {
              return this.parseMatch(match);
            }
          }
        }
      }
    }

    return null;
  }

  extractFromXPath() {
    const xpath = "//text()[contains(., '长 宽 高') or contains(., '尺寸')]";
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

      if (!parentElement) continue;

      let contextText = parentElement.textContent;
      if (parentElement.parentElement) {
        contextText = parentElement.parentElement.textContent;
      }

      const match = contextText.match(this.pattern);
      if (match) {
        return this.parseMatch(match);
      }
    }

    return null;
  }

  extractFromBody() {
    const bodyText = document.body.textContent;
    const match = bodyText.match(this.pattern);
    return match ? this.parseMatch(match) : null;
  }

  parseMatch(match) {
    return {
      length: match[1],
      width: match[2],
      height: match[3],
      unit: match[4] || 'mm',
      raw: match[0].trim(),
    };
  }
}
