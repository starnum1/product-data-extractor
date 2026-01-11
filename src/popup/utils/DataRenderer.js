export class DataRenderer {
  render(data, elements) {
    elements.emptyState.style.display = 'none';
    elements.resultSection.classList.add('show');

    this.renderDimensions(data.dimensions, elements.dimensionsData);
    this.renderWeight(data.weight, elements.weightData);
  }

  renderDimensions(dimensions, container) {
    if (dimensions) {
      const { length, width, height, unit, raw } = dimensions;
      container.innerHTML = `
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
      container.innerHTML =
        '<div class="data-item"><span class="data-label">未找到尺寸数据</span></div>';
    }
  }

  renderWeight(weight, container) {
    if (weight) {
      const { value, unit, raw } = weight;
      container.innerHTML = `
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
      container.innerHTML =
        '<div class="data-item"><span class="data-label">未找到重量数据</span></div>';
    }
  }
}
