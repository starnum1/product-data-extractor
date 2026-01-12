/**
 * UNI 物流渠道配置
 * 
 * 字段说明：
 * @property {string} channel_type - 渠道类型：描述该渠道适用的包裹类型和重量范围
 * @property {string} channel_name - 渠道名称：具体的运输服务名称
 * @property {string} code - 渠道代码：在系统中使用的唯一标识符
 * @property {string} delivery_days - 预计时效：官方承诺的运输时效范围
 * @property {string} recent_delivery - 近期时效：UNI最近6个月的实际平均配送时效
 * @property {string} pickup_price_formula - 自提点价格公式：显示给用户的价格计算公式字符串
 * @property {number} max_weight_g - 最大重量：该渠道允许的最大重量（单位：克）
 * @property {number} min_weight_g - 最小重量：该渠道允许的最小重量（单位：克）
 * @property {number} max_value_rub - 最大货值：该渠道允许的最高货物价值（单位：卢布）
 * @property {number} min_value_rub - 最小货值：该渠道要求的最低货物价值（单位：卢布）
 * @property {number} max_dimension_cm - 最大单边尺寸：包裹最长边的限制（单位：厘米）
 * @property {number} max_girth_cm - 最大三边和：包裹长+宽+高的总和限制（单位：厘米）
 * @property {string} notes - 注意事项：运输特殊要求或限制说明
 * @property {number} pickup_base - 自提点基础费：自提服务的固定费用部分（单位：元）
 * @property {number} pickup_per_g - 自提点每克费率：自提服务的重量计费单价（单位：元/克）
 */
export const SHIPPING_CHANNELS = [
  {
    channel_type: "UNI Extra Small（超级轻小件）：1g-500g",
    channel_name: "UNI Economy Extra Small",
    code: "UNW",
    delivery_days: "20-25天",
    recent_delivery: "20天",
    pickup_price_formula: "3 元 + 0.025 元/1克",
    max_weight_g: 500,
    min_weight_g: 1,
    max_value_rub: 1500,
    min_value_rub: 0,
    max_dimension_cm: 60,
    max_girth_cm: 90,
    notes: "",
    pickup_base: 3,
    pickup_per_g: 0.025,
  },
  {
    channel_type: "UNI Budget（低客单标准件）：501g-25kg",
    channel_name: "UNI Economy Budget",
    code: "UNZ",
    delivery_days: "20-25天",
    recent_delivery: "20天",
    pickup_price_formula: "23 元 + 0.0170 元/1克",
    max_weight_g: 25000,
    min_weight_g: 501,
    max_value_rub: 1500,
    min_value_rub: 0,
    max_dimension_cm: 60,
    max_girth_cm: 150,
    notes: "",
    pickup_base: 23,
    pickup_per_g: 0.017,
  },
  {
    channel_type: "UNI Small（轻小件）：1g-2kg",
    channel_name: "UNI Economy Small",
    code: "UNV",
    delivery_days: "12-17天",
    recent_delivery: "",
    pickup_price_formula: "16 元 + 0.025 元/1克",
    max_weight_g: 2000,
    min_weight_g: 1,
    max_value_rub: 7000,
    min_value_rub: 1501,
    max_dimension_cm: 60,
    max_girth_cm: 150,
    notes: "",
    pickup_base: 16,
    pickup_per_g: 0.025,
  },
  {
    channel_type: "UNI Big（大件）：2.001kg-25kg",
    channel_name: "UNI Economy Big",
    code: "UNZ",
    delivery_days: "20-25天",
    recent_delivery: "20天",
    pickup_price_formula: "36 元 + 0.017 元/1克",
    max_weight_g: 25000,
    min_weight_g: 2001,
    max_value_rub: 7000,
    min_value_rub: 1501,
    max_dimension_cm: 150,
    max_girth_cm: 250,
    notes: "",
    pickup_base: 36,
    pickup_per_g: 0.017,
  },
  {
    channel_type: "UNI Premium Small（高客单轻小件）：1g-5kg",
    channel_name: "UNI Economy Premium Small",
    code: "UNM",
    delivery_days: "13-18天",
    recent_delivery: "",
    pickup_price_formula: "22 元 + 0.0250 元/1克",
    max_weight_g: 5000,
    min_weight_g: 1,
    max_value_rub: 250000,
    min_value_rub: 7001,
    max_dimension_cm: 150,
    max_girth_cm: 250,
    notes: "",
    pickup_base: 22,
    pickup_per_g: 0.025,
  },
  {
    channel_type: "UNI Premium Big（高客单大件）：5.001kg-25kg",
    channel_name: "UNI Economy Premium Big",
    code: "UNZ",
    delivery_days: "20-25天",
    recent_delivery: "",
    pickup_price_formula: "62元 + 0.023元/1克",
    max_weight_g: 25000,
    min_weight_g: 5001,
    max_value_rub: 250000,
    min_value_rub: 7001,
    max_dimension_cm: 150,
    max_girth_cm: 310,
    notes: "",
    pickup_base: 62,
    pickup_per_g: 0.023,
  },
];
