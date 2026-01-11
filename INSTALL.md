# 安装指南

## 快速开始

### 1. 准备图标（重要）

插件需要图标才能正常加载。请选择以下方法之一：

#### 方法A：临时跳过图标（最快）
编辑 `manifest.json`，删除或注释掉 `icons` 和 `action.default_icon` 部分：

```json
{
  "manifest_version": 3,
  "name": "商品数据提取器",
  "version": "1.0.0",
  "description": "一键提取商品的长宽高和重量数据",
  "permissions": [
    "activeTab",
    "scripting",
    "storage"
  ],
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ]
}
```

#### 方法B：创建简单图标
1. 打开 Windows 画图工具
2. 创建 128x128 像素的图片
3. 填充紫色背景，画一个白色方框
4. 另存为 `icons/icon128.png`
5. 调整大小创建 `icon48.png` 和 `icon16.png`

### 2. 安装插件

1. 打开 Chrome 浏览器
2. 地址栏输入：`chrome://extensions/`
3. 打开右上角的"开发者模式"开关
4. 点击"加载已解压的扩展程序"
5. 选择 `product-data-extractor` 文件夹
6. 安装完成！

### 3. 使用插件

1. 访问包含商品数据的页面（如OZON、淘宝等）
2. 等待数据卡片加载完成
3. 点击浏览器工具栏的插件图标
4. 点击"提取数据"按钮
5. 查看并复制提取的数据

## 常见问题

### Q: 提示"无法连接到页面"
A: 刷新页面后重试，或重新加载插件

### Q: 提取不到数据
A: 确保数据卡片已完全加载，包含"长 宽 高"或"重 量"等关键词

### Q: 插件图标不显示
A: 这是因为缺少图标文件，不影响功能使用。可以按照上面的方法添加图标。

## 测试页面

可以在以下类型的页面测试：
- OZON商品页面（俄语）
- 淘宝/天猫商品页面（中文）
- 京东商品页面（中文）
- Amazon商品页面（英语）

只要页面包含格式化的尺寸和重量数据，插件就能识别。
