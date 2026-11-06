# 把 shot.ps1 产出的 raw_*.png 裁成 430×900，并拼成一张总览图
from PIL import Image, ImageDraw, ImageFont
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, 'out')
W, H = 430, 900

SHOTS = [
    ('home', '首页'), ('schedule', '赛程'), ('training', '训练详情'), ('import', '接龙导入'),
    ('rollcall', '点名台'), ('match', '比赛报名'), ('me', '我的'), ('injury', '伤病档案'),
]

def font(size):
    for f in (r'C:\Windows\Fonts\msyhbd.ttc', r'C:\Windows\Fonts\msyh.ttc', r'C:\Windows\Fonts\simhei.ttf'):
        if os.path.exists(f):
            try:
                return ImageFont.truetype(f, size)
            except Exception:
                pass
    return ImageFont.load_default()

f_label = font(17)
f_head = font(26)
f_sub = font(14)

imgs = {}
for key, label in SHOTS:
    p = os.path.join(OUT, 'raw_%s.png' % key)
    im = Image.open(p).convert('RGB').crop((0, 0, W * 2, H * 2)).resize((W, H), Image.LANCZOS)
    im.save(os.path.join(OUT, 'screen_%s.png' % key))
    imgs[key] = im

COLS, ROWS = 4, 2
GAP, PAD, HEAD, LAB = 26, 44, 86, 30
BW = PAD * 2 + COLS * W + (COLS - 1) * GAP
BH = HEAD + ROWS * (H + LAB) + (ROWS - 1) * GAP + PAD

board = Image.new('RGB', (BW, BH), (10, 21, 38))
d = ImageDraw.Draw(board)
d.text((PAD, 30), 'STRIKERS', font=f_head, fill=(255, 255, 255))
d.text((PAD + 150, 40), '微信小程序 · 可交互原型', font=f_sub, fill=(140, 170, 210))
d.text((BW - PAD - 300, 40), '技术原型：原生 HTML/CSS/JS，单页 + hash 路由', font=f_sub, fill=(120, 150, 190))

for i, (key, label) in enumerate(SHOTS):
    c, r = i % COLS, i // COLS
    x = PAD + c * (W + GAP)
    y = HEAD + r * (H + LAB + GAP)
    board.paste(imgs[key], (x, y))
    d.text((x + 4, y + H + 7), label, font=f_label, fill=(150, 175, 205))

board.save(os.path.join(OUT, 'board.png'))
print('board %dx%d' % board.size)
