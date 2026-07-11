"""Generate TOEIC PWA icons via PIL."""
import os, sys
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(__file__), '..', 'icons')
os.makedirs(OUT, exist_ok=True)

FONT_BOLD = 'C:/Windows/Fonts/arialbd.ttf'
FONT_REG = 'C:/Windows/Fonts/arial.ttf'

BG = '#1a3a5c'
ACCENT = '#5b8cce'

def make_icon(size, maskable=False):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    if maskable:
        # Full background, no transparency
        img = Image.new('RGB', (size, size), '#0f1f30')
        draw = ImageDraw.Draw(img)
        bg = '#1a3a5c'
    else:
        # Rounded rect
        r = size // 8
        draw.rounded_rectangle([0, 0, size - 1, size - 1], r, fill=BG)

    # Content safe area for maskable: ~78% centered
    if maskable:
        margin = size * 0.11
        safe_size = size * 0.78
    else:
        margin = size * 0.14
        safe_size = size * 0.72

    cx, cy = size / 2, size / 2
    ox = cx - safe_size / 2
    oy = cy - safe_size / 2

    try:
        font_b = ImageFont.truetype(FONT_BOLD, int(safe_size * 0.55))
    except OSError:
        font_b = ImageFont.load_default()
    try:
        font_r = ImageFont.truetype(FONT_REG, int(safe_size * 0.28))
    except OSError:
        font_r = ImageFont.load_default()
    try:
        font_s = ImageFont.truetype(FONT_REG, int(safe_size * 0.12))
    except OSError:
        font_s = ImageFont.load_default()

    # White "T"
    t_bbox = draw.textbbox((0, 0), 'T', font=font_b)
    tw = t_bbox[2] - t_bbox[0]
    th = t_bbox[3] - t_bbox[1]
    tx = cx - tw / 2
    ty_base = oy + safe_size * 0.38 + th * 0.3
    draw.text((tx, ty_base - th), 'T', fill='white', font=font_b)

    # Light blue "OEIC"
    o_text = 'OEIC'
    o_bbox = draw.textbbox((0, 0), o_text, font=font_r)
    ow = o_bbox[2] - o_bbox[0]
    oh = o_bbox[3] - o_bbox[1]
    ox2 = cx - ow / 2
    oy2 = ty_base + safe_size * 0.01
    draw.text((ox2, oy2), o_text, fill=ACCENT, font=font_r)

    # Underline accent
    ul_y = oy2 + oh + safe_size * 0.06
    ul_w = ow * 1.05
    ul_x = cx - ul_w / 2
    draw.rectangle([ul_x, ul_y, ul_x + ul_w, ul_y + max(2, int(safe_size * 0.03))], fill=ACCENT)

    # Small subtitle
    sub_text = 'PRACTICE'
    try:
        font_sub = ImageFont.truetype(FONT_REG, int(safe_size * 0.08))
    except OSError:
        font_sub = ImageFont.load_default()
    sub_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    sw = sub_bbox[2] - sub_bbox[0]
    sx = cx - sw / 2
    sy = ul_y + safe_size * 0.06
    draw.text((sx, sy), sub_text, fill='#a0b8d0', font=font_sub)

    return img


sizes = [(192, 'icon-192.png', False),
         (512, 'icon-512.png', False),
         (512, 'icon-maskable-512.png', True),
         (180, 'apple-touch-icon.png', False),
         (64, 'favicon-64.png', False)]

for sz, fname, maskable in sizes:
    img = make_icon(sz, maskable=maskable)
    path = os.path.join(OUT, fname)
    img.save(path, 'PNG')
    fs = os.path.getsize(path)
    print(f'OK {fname} ({sz}x{sz}) maskable={maskable} size={fs} bytes')
    assert fs > 0, f'Zero-byte file: {fname}'

print('All icons generated successfully.')
