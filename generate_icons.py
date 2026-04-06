from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

ASSETS = os.path.join(os.path.dirname(__file__), 'assets')

BG_TOP  = (26,  58,  92)   # #1a3a5c
BG_BOT  = (45, 106, 159)   # #2d6a9f
WHITE   = (255, 255, 255, 255)
GOLD    = (240, 180,  41, 255)  # #f0b429


# ── helpers ──────────────────────────────────────────────────────────────────

def lerp(a, b, t):
    return int(a + (b - a) * t)

def make_gradient(w, h):
    img = Image.new('RGBA', (w, h))
    px = img.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        r, g, b = lerp(BG_TOP[0], BG_BOT[0], t), lerp(BG_TOP[1], BG_BOT[1], t), lerp(BG_TOP[2], BG_BOT[2], t)
        for x in range(w):
            px[x, y] = (r, g, b, 255)
    return img

def apply_rounded_corners(img, radius):
    """Clip image to rounded rectangle via alpha mask."""
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.width - 1, img.height - 1],
                                           radius=radius, fill=255)
    out = img.copy()
    out.putalpha(mask)
    return out

def find_font(size):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ]
    for p in candidates:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            pass
    return ImageFont.load_default()


# ── main drawing routine ──────────────────────────────────────────────────────

def generate_icon(canvas_w, canvas_h, icon_size, output_path):
    """
    canvas_w/h  – final PNG dimensions
    icon_size   – logical size used to scale all elements (treat as if 1024×1024)
    """
    s   = icon_size / 1024          # scale factor
    cx  = canvas_w // 2
    cy  = canvas_h // 2

    # ── geometry ──────────────────────────────────────────────────────────────
    body_w   = int(380 * s)
    body_h   = int(270 * s)
    roof_h   = int(210 * s)
    overhang = int(30  * s)

    total_h  = roof_h + body_h
    roof_top = cy - total_h // 2
    body_top = roof_top + roof_h
    body_bot = body_top + body_h
    bl       = cx - body_w // 2
    br       = cx + body_w // 2

    roof_pts = [
        (cx,              roof_top),
        (bl - overhang,   body_top),
        (br + overhang,   body_top),
    ]

    # ── gradient background ───────────────────────────────────────────────────
    img = make_gradient(canvas_w, canvas_h)

    # ── shadow (blurred offset house shape) ───────────────────────────────────
    sh_off  = int(14 * s)
    sh_blur = max(1, int(18 * s))

    shadow = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    sd     = ImageDraw.Draw(shadow)
    sc     = (0, 0, 0, 100)
    sd.rectangle([bl + sh_off, body_top + sh_off, br + sh_off, body_bot + sh_off], fill=sc)
    sd.polygon([(p[0] + sh_off, p[1] + sh_off) for p in roof_pts], fill=sc)
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=sh_blur))
    img    = Image.alpha_composite(img, shadow)

    # ── house silhouette ──────────────────────────────────────────────────────
    draw = ImageDraw.Draw(img)
    draw.polygon(roof_pts,                              fill=WHITE)
    draw.rectangle([bl, body_top, br, body_bot],        fill=WHITE)

    # small door cutout (dark blue) for extra detail
    door_w = int(70 * s)
    door_h = int(90 * s)
    door_l = cx - door_w // 2
    door_r = cx + door_w // 2
    draw.rectangle([door_l, body_bot - door_h, door_r, body_bot],
                   fill=(26, 58, 92, 255))

    # ── "%" in gold ───────────────────────────────────────────────────────────
    fs   = max(2, int(120 * s))
    font = find_font(fs)

    # centre in body (above door)
    body_centre_y = body_top + (body_h - door_h) // 2
    bb   = draw.textbbox((0, 0), "%", font=font)
    tw   = bb[2] - bb[0]
    th   = bb[3] - bb[1]
    tx   = cx - tw // 2 - bb[0]
    ty   = body_centre_y - th // 2 - bb[1]
    draw.text((tx, ty), "%", fill=GOLD, font=font)

    # ── rounded corners ───────────────────────────────────────────────────────
    corner_r = int(200 * s)
    img = apply_rounded_corners(img, corner_r)

    # ── save ─────────────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"  {os.path.basename(output_path):28s}  {canvas_w}x{canvas_h}  (icon_size={icon_size})")


# ── entry point ───────────────────────────────────────────────────────────────

def main():
    print("Generating icons…")
    generate_icon(1024, 1024, 1024, os.path.join(ASSETS, 'icon.png'))
    generate_icon(1024, 1024, 1024, os.path.join(ASSETS, 'adaptive-icon.png'))
    generate_icon(1284, 2778,  550, os.path.join(ASSETS, 'splash-icon.png'))
    generate_icon(  32,   32,   32, os.path.join(ASSETS, 'favicon.png'))
    print("Done.")

if __name__ == '__main__':
    main()
