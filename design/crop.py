from PIL import Image
import os

BASE = os.path.dirname(os.path.abspath(__file__))
im = Image.open(os.path.join(BASE, "out", "board.png"))
W, H = im.size
sx, sy = W / 1285, H / 2780
n = 1
for j in range(3):
    for i in range(3):
        x = int((48 + i * 407) * sx)
        y = int((144 + j * 888) * sy)
        box = (x, y, x + int(375 * sx), y + int(812 * sy))
        im.crop(box).save(os.path.join(BASE, "out", f"s{n:02d}.png"))
        n += 1
print("cropped", n - 1, "screens from", im.size)
