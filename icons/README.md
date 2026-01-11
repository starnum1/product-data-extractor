# 图标生成说明

由于无法直接生成PNG文件，请使用以下方法之一创建图标：

## 方法1：使用在线工具（推荐）
1. 访问 https://www.favicon-generator.org/
2. 上传任意图片或使用文字 "📦"
3. 生成 16x16, 48x48, 128x128 三个尺寸
4. 下载并重命名为 icon16.png, icon48.png, icon128.png
5. 放入此文件夹

## 方法2：使用Python脚本
```bash
pip install pillow
python generate-icons.py
```

## 方法3：手动创建
使用任意图片编辑软件（如Paint、Photoshop）创建：
- icon16.png (16x16像素)
- icon48.png (48x48像素)
- icon128.png (128x128像素)

建议使用紫色渐变背景 + 白色包裹盒子图案

## 临时方案
如果暂时没有图标，可以先注释掉 manifest.json 中的 icons 部分，插件仍可正常使用。
