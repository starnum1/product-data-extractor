# 商品数据提取器 - 工程化版本

## 项目结构

```
product-data-extractor/
├── src/
│   ├── content/                    # Content Script
│   │   ├── extractors/            # 数据提取器
│   │   │   ├── DataExtractor.js   # 主提取器
│   │   │   ├── DimensionExtractor.js  # 尺寸提取
│   │   │   ├── WeightExtractor.js     # 重量提取
│   │   │   └── strategies/        # 提取策略
│   │   │       └── ExtractionStrategy.js
│   │   ├── config/                # 配置文件
│   │   │   └── patterns.js        # 正则模式配置
│   │   ├── utils/                 # 工具类
│   │   │   └── DOMObserver.js     # DOM监听器
│   │   └── index.js               # Content入口
│   │
│   └── popup/                      # Popup页面
│       ├── controllers/           # 控制器
│       │   └── UIController.js    # UI控制器
│       ├── services/              # 服务层
│       │   └── DataService.js     # 数据服务
│       ├── utils/                 # 工具类
│       │   ├── MessageHandler.js  # 消息处理
│       │   └── DataRenderer.js    # 数据渲染
│       ├── styles/                # 样式文件
│       │   └── popup.css
│       ├── popup.html
│       └── popup.js               # Popup入口
│
├── dist/                          # 构建输出目录
├── icons/                         # 图标资源
├── manifest.json                  # 插件配置
├── vite.config.js                 # Vite配置
├── package.json
├── .eslintrc.json                 # ESLint配置
└── .prettierrc                    # Prettier配置
```

## 架构优化

### 1. 模块化设计
- **提取器模块**: 独立的尺寸和重量提取器，易于扩展
- **策略模式**: 多种提取策略，按优先级尝试
- **服务层**: 分离业务逻辑和UI逻辑
- **控制器**: MVC模式管理UI交互

### 2. 配置集中管理
- 所有正则表达式和关键词统一在 `config/patterns.js`
- 易于维护和修改匹配规则

### 3. 职责分离
- **DataExtractor**: 协调各个提取器
- **DimensionExtractor**: 专注尺寸提取
- **WeightExtractor**: 专注重量提取
- **UIController**: 管理UI交互
- **DataService**: 处理Chrome API通信
- **DataRenderer**: 负责数据渲染

## 开发指南

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
监听文件变化，自动重新构建

### 生产构建
```bash
npm run build
```
输出到 `dist/` 目录

### 代码检查
```bash
npm run lint
```

### 代码格式化
```bash
npm run format
```

## 安装插件

1. 运行 `npm run build` 构建项目
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `dist/` 文件夹

## 如何添加新功能

### 添加新的数据提取类型

1. 在 `src/content/extractors/` 创建新的提取器类
```javascript
// src/content/extractors/PriceExtractor.js
export class PriceExtractor {
  extractFromSpans() { /* ... */ }
  extractFromXPath() { /* ... */ }
  extractFromBody() { /* ... */ }
}
```

2. 在 `src/content/config/patterns.js` 添加配置
```javascript
export const PRICE_KEYWORDS = ['价格', 'price', 'цена'];
export const PRICE_PATTERN = /(\d+\.?\d*)\s*(元|¥|USD|\$)/i;
```

3. 在 `DataExtractor.js` 中集成
```javascript
import { PriceExtractor } from './PriceExtractor.js';

constructor() {
  this.priceExtractor = new PriceExtractor();
}

extract() {
  result.price = this.strategy.extractPrice(this.priceExtractor);
}
```

### 添加新的UI功能

1. 在 `UIController.js` 添加事件处理
2. 在 `DataRenderer.js` 添加渲染逻辑
3. 在 `popup.css` 添加样式

## 技术栈

- **构建工具**: Vite 5.0
- **代码规范**: ESLint + Prettier
- **模块系统**: ES Modules
- **架构模式**: MVC + 策略模式
- **浏览器API**: Chrome Extension Manifest V3

## 优势

✅ **可维护性**: 模块化设计，职责清晰
✅ **可扩展性**: 易于添加新的提取类型
✅ **可测试性**: 独立模块便于单元测试
✅ **开发体验**: 热重载、代码检查、自动格式化
✅ **代码质量**: 统一的代码风格和规范

## 迁移说明

旧版本文件保留在根目录：
- `popup.html` → `src/popup/popup.html`
- `popup.js` → `src/popup/popup.js` (重构为模块化)
- `content.js` → `src/content/index.js` (重构为模块化)

构建后的文件在 `dist/` 目录，结构与旧版本兼容。
