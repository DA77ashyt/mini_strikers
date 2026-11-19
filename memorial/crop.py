# -*- coding: utf-8 -*-
"""把 shot.ps1 产出的 raw_<name>.png 裁成精确的 860×1800（430×900 @2x）。

chrome 的 --window-size 在这台机器上并不等于 CSS 视口尺寸，
因此 shot.ps1 用「430×900 的 iframe + 大窗口截图」来固定版面，
再由本脚本裁掉窗口多出来的部分。裁切原点固定为 (0,0)，
只要 iframe 是页面左上角第一个元素，裁出来的就一定是设计稿尺寸。

用法：python crop.py out
"""
import os
import sys

from PIL import Image

W, H = 860, 1800  # 2x


def main(out_dir: str) -> int:
    raws = sorted(f for f in os.listdir(out_dir) if f.startswith('raw_') and f.endswith('.png'))
    if not raws:
        print('  ! no raw_*.png, skip')
        return 1
    for name in raws:
        src = os.path.join(out_dir, name)
        dst = os.path.join(out_dir, name[len('raw_'):])
        with Image.open(src) as im:
            if im.width < W or im.height < H:
                print('  ! too small: ' + name + ' ' + str(im.width) + 'x' + str(im.height))
                continue
            im.crop((0, 0, W, H)).save(dst)
        os.remove(src)
        print('  ok -> ' + os.path.basename(dst))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else 'out'))
