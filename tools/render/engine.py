"""Tiny studio renderer: normals + softbox environment reflections + AO + soft shadows. numpy/opencv/PIL only."""
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

SS = 2
OW, OH = 1000, 1100
W, H = OW * SS, OH * SS
ASSETS = '/home/claude/geoexcel/assets/'
LORA = '/usr/share/fonts/truetype/google-fonts/Lora-Variable.ttf'
INTER_B = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
INTER_S = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
INTER_M = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'


def hexc(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255.


def lora(size, w='Bold'):
    f = ImageFont.truetype(LORA, size)
    try: f.set_variation_by_name(w)
    except Exception: pass
    return f


def ss(a, b, x):
    t = np.clip((x - a) / (b - a + 1e-9), 0, 1); return t * t * (3 - 2 * t)


def blur(a, s, sy=None):
    return cv2.GaussianBlur(a, (0, 0), s, sigmaY=(sy if sy is not None else s))


def noise(shape, sx, sy=None, seed=0):
    n = np.random.RandomState(seed).randn(*shape).astype(np.float32)
    n = blur(n, sx, sy); return n / (n.std() + 1e-9)


def norm3(v): v = np.array(v, np.float32); return v / np.linalg.norm(v)


def normals_from_z(z, k=1.0):
    gy, gx = np.gradient(z)
    n = np.dstack([-gx * k, -gy * k, np.ones_like(z)])
    return n / np.linalg.norm(n, axis=2, keepdims=True)


def env(rx, ry, rough):
    sw = 0.05 + 0.55 * rough

    def box(cx, cy, hw, hh, I):
        ex = 1 - ss(hw - sw, hw + sw, np.abs(rx - cx)); ey = 1 - ss(hh - sw, hh + sw, np.abs(ry - cy)); return I * ex * ey
    e = 0.20 + 0.28 * np.clip(ry * .5 + .5, 0, 1) + 0.18 * ss(-.2, -.9, ry)
    e = e + box(-.52, .50, .30, .55, 3.4) + box(.86, .05, .06, .75, 1.7) + box(0, .96, .7, .07, 1.2) + box(-.9, -.1, .05, .6, .9)
    return e.astype(np.float32)


def shade(alb, n, rough, spec, metal, ao):
    L1, L2 = norm3((-.45, .55, .70)), norm3((.75, .15, .65))
    nl1 = np.clip((n @ L1 + .25) / 1.25, 0, 1); nl2 = np.clip((n @ L2 + .25) / 1.25, 0, 1)
    diff = .42 + .78 * nl1 + .22 * nl2 + .10 * n[..., 1]
    nz = n[..., 2]
    rx, ry = 2 * nz * n[..., 0], 2 * nz * n[..., 1]
    E = env(rx, ry, rough)
    F0 = .04 + .70 * metal
    fres = F0 + (1 - F0) * (1 - nz) ** 5
    tint = (1 - metal)[..., None] + metal[..., None] * alb
    col = alb * (diff * (1 - metal) * ao)[..., None] + (E * fres * spec)[..., None] * tint + (metal * ao * (.35 + .25 * nl1))[..., None] * alb * .6
    return col


def studio_bg(c1, ox=0.0):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    top, bot = np.array([.945, .925, .89], np.float32), np.array([.835, .805, .76], np.float32)
    t = (yy / H)[..., None]
    bg = top * (1 - t) + bot * t
    r = np.sqrt(((xx - W * (.46 + ox)) / (W * .75)) ** 2 + ((yy - H * .42) / (H * .75)) ** 2)[..., None]
    bg = bg * (1.06 - .30 * np.clip(r, 0, 1.2) ** 1.6)
    return bg * (.94 + .06 * (c1 / max(c1.max(), .01)))[None, None, :] if c1 is not None else bg


def shadows(mask, ybase, xl, xr, cast=.30, contact=.62, flat=.20):
    s = np.zeros((H, W), np.float32)
    cx, bw = (xl + xr) / 2, (xr - xl)
    cs = np.zeros((H, W), np.float32)
    cv2.ellipse(cs, (int(cx), int(ybase)), (int(bw * .56), int(H * .018)), 0, 0, 360, 1.0, -1)
    contact_s = blur(cs, H * .012) * contact
    contact_s2 = blur(cs, H * .004) * contact * .55
    # cast shadow: squash + shear the silhouette across the floor to the right/back
    M = np.float32([[1, -.33, .33 * ybase], [0, flat, ybase * (1 - flat)]])
    cast_s = cv2.warpAffine(mask.astype(np.float32), M, (W, H)); cast_s = blur(cast_s, H * .016) * cast
    cast_s = cast_s * (1 - np.clip(mask, 0, 1))
    return np.clip(contact_s + contact_s2 + cast_s, 0, .85)


def compose(col, mask, bg, shadow, reflect=None, ybase=None):
    out = bg * (1 - shadow[..., None])
    if reflect is not None and ybase is not None:
        yb = int(ybase)
        flip = np.zeros_like(col); fm = np.zeros_like(mask)
        n = min(yb, H - yb)
        flip[yb:yb + n] = col[yb - n:yb][::-1]; fm[yb:yb + n] = mask[yb - n:yb][::-1]
        fade = np.clip(1 - (np.arange(H, dtype=np.float32) - yb) / (H * .16), 0, 1)[:, None] ** 2
        fm = blur(fm, 3) * fade * reflect
        out = out * (1 - fm[..., None]) + blur(flip, 3) * fm[..., None]
    m = blur(mask.astype(np.float32), 1.1)[..., None]
    out = out * (1 - m) + col * m
    return out


def finish(img, path, seed=1):
    img = np.clip(img, 0, None)
    img = 1 - np.exp(-1.35 * img)
    img = np.clip((img - .5) * 1.06 + .5, 0, 1)
    grain = np.random.RandomState(seed).randn(*img.shape[:2]).astype(np.float32)[..., None] * .006
    img = np.clip(img + grain, 0, 1)
    out = cv2.resize((img * 255).astype(np.uint8), (OW, OH), interpolation=cv2.INTER_AREA)
    Image.fromarray(out).save(path, quality=90, optimize=True)


def sample(tex, mapx, mapy):
    return cv2.remap(tex, mapx.astype(np.float32), mapy.astype(np.float32), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)


# ---------- shared label art (PIL) ----------
def load_rgb(path, size):
    im = Image.open(path).convert('RGB'); return im.resize(size, Image.LANCZOS)


def circle_photo(canvas, photo, cx, cy, r, ring, ringw):
    im = load_rgb(ASSETS + photo, (int(r * 2.9), int(r * 2.9)))
    # center-crop square
    w = im.size[0]; im = im.crop((w // 2 - r, w // 2 - r, w // 2 + r, w // 2 + r))
    m = Image.new('L', (r * 2 * 4, r * 2 * 4), 0); ImageDraw.Draw(m).ellipse((0, 0, r * 8 - 1, r * 8 - 1), fill=255); m = m.resize((r * 2, r * 2), Image.LANCZOS)
    canvas.paste(im, (cx - r, cy - r), m)
    d = ImageDraw.Draw(canvas); d.ellipse((cx - r - ringw // 2, cy - r - ringw // 2, cx + r + ringw // 2, cy + r + ringw // 2), outline=ring, width=ringw)


def logo_img(sz):
    return Image.open(ASSETS + 'logo.png').convert('RGBA').resize((sz, sz), Image.LANCZOS)


def center_text(d, xy, text, font, fill, tracking=0):
    x, y = xy
    if tracking:
        ws = [d.textlength(ch, font=font) for ch in text]; tw = sum(ws) + tracking * (len(text) - 1); cx = x - tw / 2
        for ch, w in zip(text, ws): d.text((cx, y), ch, font=font, fill=fill, anchor='lm'); cx += w + tracking
    else:
        d.text((x, y), text, font=font, fill=fill, anchor='mm')
