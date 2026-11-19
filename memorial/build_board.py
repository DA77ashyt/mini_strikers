# 把 shot.ps1 产出的 9 张 860x1800 截图拼成一张 3x3 总览图
# 用法：python memorial/build_board.py
from PIL import Image, ImageDraw, ImageFont
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'out')
W, H = 430, 900

SHOTS = [
    ('01-home', '队史馆', '封面 + 四个数字 + 引言'),
    ('02-timeline', '编年史', '年份条 + 时间轴'),
    ('03-album', '相册', '年份筛选 + 瀑布流'),
    ('04-photo', '照片详情', '大图 + 照片里的人'),
    ('05-roster', '名册', '现役 / 已毕业 / 退役号码'),
    ('06-person', '个人档案', '号码水印 + 荣誉 + 记忆'),
    ('07-story', '队史长文', 'serif 正文 + 首字下沉'),
    ('08-me', '我的', '我的数字 + 找回老队友'),
    ('09-submit', '上传记忆', '照片 / 年份 / 一句话'),
]

INK = (11, 10, 61)        # #0B0A3D
WHITE = (255, 255, 255)
SUB = (150, 165, 215)
LAB = (170, 185, 225)


def font(size, bold=False):
    names = ['msyhbd.ttc', 'msyh.ttc', 'simhei.ttf'] if bold else ['msyh.ttc', 'msyhbd.ttc', 'simhei.ttf']
    for n in names:
        p = os.path.join(r'C:\Windows\Fonts', n)
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


f_head = font(30, True)
f_sub = font(15)
f_label = font(19, True)
f_note = font(14)

imgs = {}
for key, label, note in SHOTS:
    im = Image.open(os.path.join(OUT, key + '.png')).convert('RGB')
    im = im.resize((W, H), Image.LANCZOS)
    imgs[key] = im

COLS, ROWS = 3, 3
GAP, PAD, HEAD, LAB = 28, 48, 104, 34
BW = PAD * 2 + COLS * W + (COLS - 1) * GAP
BH = HEAD + ROWS * (H + LAB) + (ROWS - 1) * GAP + PAD

board = Image.new('RGB', (BW, BH), INK)
d = ImageDraw.Draw(board)

d.text((PAD, 30), 'STRIKERS', font=f_head, fill=WHITE)
d.text((PAD + 168, 40), '队史馆 · 原型 v2', font=f_sub, fill=SUB)
sub = '主色＝突袭者蓝 #141371 · 海军蓝 #073A8B（两枚参考色的梯度）'
d.text((PAD + 340, 40), sub, font=f_sub, fill=SUB)

# 调色板色块
sw = [((20, 19, 113), '#141371'), ((7, 58, 139), '#073A8B'),
      ((15, 82, 181), '#0F52B5'), ((231, 237, 249), '#E7EDF9')]
x = BW - PAD - (len(sw) * 34)
for rgb, hexv in sw:
    d.rounded_rectangle([x, 32, x + 26, 62], radius=7, fill=rgb, outline=(90, 105, 165))
    x += 34

for i, (key, label, note) in enumerate(SHOTS):
    c, r = i % COLS, i // COLS
    x = PAD + c * (W + GAP)
    y = HEAD + r * (H + LAB + GAP)
    board.paste(imgs[key], (x, y))
    d.rectangle([x - 1, y - 1, x + W, y + H], outline=(46, 48, 105))
    d.text((x + 2, y + H + 7), label, font=f_label, fill=WHITE)
    d.text((x + 2, y + H + 30), note, font=f_note, fill=LAB)

path = os.path.join(OUT, 'board9.png')
board.save(path)
print('board9 %dx%d -> %s' % (board.width, board.height, path))
