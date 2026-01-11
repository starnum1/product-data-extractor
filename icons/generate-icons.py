from PIL import Image, ImageDraw, ImageFont

def create_icon(size):
    # 创建渐变背景
    img = Image.new('RGBA', (size, size), (102, 126, 234, 255))
    draw = ImageDraw.Draw(img)
    
    # 绘制圆角矩形背景
    draw.rounded_rectangle([(0, 0), (size, size)], radius=size//6, fill=(102, 126, 234, 255))
    
    # 绘制白色盒子
    box_size = int(size * 0.6)
    box_x = (size - box_size) // 2
    box_y = (size - box_size) // 2
    draw.rounded_rectangle(
        [(box_x, box_y), (box_x + box_size, box_y + box_size)],
        radius=size//20,
        fill=(255, 255, 255, 230)
    )
    
    # 绘制尺寸线
    line_width = max(1, size // 40)
    # 水平线
    draw.line([(box_x, box_y - size//10), (box_x + box_size, box_y - size//10)], 
              fill=(255, 255, 255, 255), width=line_width)
    # 垂直线
    draw.line([(box_x - size//10, box_y), (box_x - size//10, box_y + box_size)], 
              fill=(255, 255, 255, 255), width=line_width)
    
    # 保存
    img.save(f'icon{size}.png', 'PNG')
    print(f'Created icon{size}.png')

# 生成三个尺寸的图标
for size in [16, 48, 128]:
    create_icon(size)

print('All icons created successfully!')
