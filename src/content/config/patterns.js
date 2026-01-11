// 尺寸相关配置
export const DIMENSION_KEYWORDS = [
  '长 宽 高',
  '长宽高',
  '尺寸',
  'размер',
  'dimensions',
  'size',
];

export const DIMENSION_PATTERN =
  /(\d+)\s*[xX×]\s*(\d+)\s*[xX×]\s*(\d+)\s*(mm|cm|m|мм|см|м|inches?|in)?/i;

// 重量相关配置
export const WEIGHT_KEYWORDS = ['重 量', '重量', 'вес', 'weight'];

export const WEIGHT_PATTERN = /(\d+\.?\d*)\s*(g|kg|кг|г|lb|oz|克|千克|公斤)/i;
