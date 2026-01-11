import { WEIGHT_KEYWORDS, WEIGHT_PATTERN } from '../config/patterns.js';

export class WeightExtractor {
  constructor() {
    this.keywords = WEIGHT_KEYWORDS;
    this.pattern = WEIGHT_PATTERN;
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
    const xpath = "//text()[contains(., '重 量') or contains(., '重量')]";
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
    const match = bodyText.match(/重\s*[量:][\s\S]{0,50}?(\d+\.?\d*)\s*(g|kg|кг|г|克|千克|公斤)/i);
    return match ? { value: match[1], unit: match[2], raw: `${match[1]}${match[2]}` } : null;
  }

  parseMatch(match) {
    return {
      value: match[1],
      unit: match[2],
      raw: match[0].trim(),
    };
  }
}
