from engine import *
from PIL import ImageFilter

def pouch_art(p, TW=800, TH=1330):
    c1, c2 = hexc(p['c1']), hexc(p['c2'])
    yy = np.linspace(0, 1, TH, dtype=np.float32)[:, None, None]
    xx = np.linspace(0, 1, TW, dtype=np.float32)[None, :, None]
    base = c1 * (1 - yy) + c2 * yy
    base = base * (.92 + .10 * np.sin(xx * 3.1))                      # soft print gradient
    wave = (np.sin(xx * 7 + 1.0) * .035 + .84)
    base = np.where(yy > wave, base * .84 + c2 * .04, base)             # darker wave band at the foot
    img = Image.fromarray((np.clip(base, 0, 1) * 255).astype(np.uint8)).convert('RGB')
    d = ImageDraw.Draw(img)
    lum = float(base[0, 0, 0] * .2126 + base[0, 0, 1] * .7152 + base[0, 0, 2] * .0722) * .5 + float(base[-1, 0, 0] * .2126 + base[-1, 0, 1] * .7152 + base[-1, 0, 2] * .0722) * .5
    FT = (255, 255, 255) if lum < .42 else (38, 26, 12)
    # label window
    L, R, T, B = int(TW * .11), int(TW * .89), 250, 1045
    sh = Image.new('L', (TW, TH), 0); ImageDraw.Draw(sh).rounded_rectangle((L + 6, T + 10, R + 6, B + 10), 46, fill=70)
    img = Image.composite(Image.new('RGB', (TW, TH), (20, 14, 8)), img, sh.filter(ImageFilter.GaussianBlur(14))) if False else img
    d.rounded_rectangle((L, T, R, B), 46, fill=(251, 246, 234))
    cx = TW // 2
    if p.get('photo'):
        circle_photo(img, p['photo'], cx, 478, int(TW * .26), tuple((c2 * 255).astype(int)), 8)
    # brand row
    lg = logo_img(46); img.paste(lg, (cx - 118, 758 - 23), lg)
    center_text(d, (cx + 18, 758), 'GEO EXCEL', ImageFont.truetype(INTER_B, 26), (29, 27, 23), tracking=7)
    f = lora(78)
    d.text((cx, 838), p['short'][0], font=f, fill=(29, 27, 23), anchor='mm')
    d.text((cx, 918), p['short'][1], font=f, fill=(29, 27, 23), anchor='mm')
    center_text(d, (cx, 985), p['tag'].upper(), ImageFont.truetype(INTER_S, 22), tuple((c2 * 255 * .8).astype(int)), tracking=4)
    # four-colour footer stripe (logo colours)
    for i, col in enumerate([(247, 147, 30), (78, 205, 196), (224, 49, 63), (63, 168, 85)]):
        d.rectangle((L + 40 + i * ((R - L - 80) // 4), B - 22, L + 40 + (i + 1) * ((R - L - 80) // 4) - 4, B - 14), fill=col)
    center_text(d, (cx, 1115), 'NET ' + p['sizes'][min(1, len(p['sizes']) - 1)]['l'].upper(), ImageFont.truetype(INTER_S, 30), FT, tracking=6)
    center_text(d, (cx, 1155), 'PACKED IN INDIA', ImageFont.truetype(INTER_M, 20), FT, tracking=5)
    matte = np.zeros((TH, TW), np.float32); m = Image.new('L', (TW, TH), 0); ImageDraw.Draw(m).rounded_rectangle((L, T, R, B), 46, fill=255)
    matte = np.asarray(m, np.float32) / 255.
    return np.asarray(img, np.float32) / 255., matte


def render_pouch(p, out, seed=3):
    rs = np.random.RandomState(seed)
    art, matte = pouch_art(p)
    TH, TW = matte.shape
    c1 = hexc(p['c1'])
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx = W * .5; top = 120 * SS; bot = 930 * SS; hgt = bot - top; Wd = 560 * SS
    v = (yy - top) / hgt
    hw = Wd / 2 * (.955 + .045 * np.sin(np.pi * np.clip(v / .9, 0, 1) ** .8))
    # bottom edge curves downward in the middle (seen slightly from above)
    u = (xx - cx) / hw
    ybot = bot + 38 * SS * (1 - np.clip(u, -1, 1) ** 2)
    mask = ((np.abs(u) <= 1) & (yy >= top) & (yy <= ybot)).astype(np.uint8)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * 26 * SS + 1,) * 2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, k).astype(np.float32)
    v = (yy - top) / (ybot - top)
    uc = np.clip(u, -1, 1)
    h = ss(.07, .36, v) * (1 - .25 * ss(.86, 1.0, v))
    T = 190 * SS
    z = T * h * (1 - uc ** 2) ** .5
    # crinkles: anisotropic noise, stronger near seal and edges
    wgt = (.35 + 1.2 * ss(.45, .08, v) + .9 * ss(.6, 1.0, np.abs(uc))) * ss(.06, .14, v)
    cr = (noise((H, W), 26 * SS, 8 * SS, seed) * 1.5 + noise((H, W), 8 * SS, 3 * SS, seed + 1) * .45 + noise((H, W), 4 * SS, 18 * SS, seed + 2) * .5)
    folds = np.sin(uc * 9 + noise((H, W), 60 * SS / 2, seed=seed + 5) * 1.4) * 1.8 * ss(.50, .10, v)
    phi0 = .95
    mt0 = sample(matte, (np.arcsin(np.clip(uc * np.sin(phi0), -1, 1)) / phi0 * .5 + .5) * (TW - 1), np.clip(v, 0, 1) * (TH - 1))
    z = z + (cr * wgt + folds) * SS * (1 - .8 * mt0)
    # top seal: crimp ridges + zip groove
    seal = (v < .085).astype(np.float32)
    z = z * (1 - seal) + seal * (3 * SS * np.sin(yy * (2 * np.pi / (9 * SS))) + 4 * SS)
    z -= 5 * SS * np.exp(-((v - .105) / .0045) ** 2)
    z = blur(z, 1.2)
    n = normals_from_z(z, 1.0)
    # label texture mapping with cylindrical foreshortening
    phi = .95
    s = np.arcsin(np.clip(uc * np.sin(phi), -1, 1)) / phi
    mx = (s * .5 + .5) * (TW - 1); my = np.clip(v, 0, 1) * (TH - 1) + 0 * z
    alb = sample(art, mx, my); mt = sample(matte, mx, my)
    # slightly lighter seal strip
    alb = alb * (1 + .10 * seal[..., None])
    # print ink slightly dulls the foil under the label; foil elsewhere
    rough = .16 * (1 - mt) + .58 * mt
    spec = 1.05 * (1 - mt) + .22 * mt
    metal = .38 * (1 - mt)
    # ambient occlusion from height curvature + edges
    ao = np.clip(1 - .55 * ss(.0, 1.0, (blur(z, 18 * SS) - z) / (6 * SS)) , .55, 1)
    ao = ao * (.80 + .20 * ss(0, .12, 1 - np.abs(uc)))
    col = shade(alb, n, rough, spec, metal, ao)
    ybase = bot + 38 * SS
    bg = studio_bg(c1)
    sh = shadows(mask, ybase - 14 * SS, cx - Wd / 2, cx + Wd / 2)
    img = compose(col, mask, bg, sh, reflect=.10, ybase=ybase)
    finish(img, out)

if __name__ == '__main__':
    import sys, json, re
    sys.path.insert(0, '.')
    from PIL import ImageFilter
    p = dict(c1='#c98a3b', c2='#8f5a1c', photo='rice.jpg', short=['Basmati', '1121 Steam'], tag='Extra long grain', sizes=[{'l': '1 kg'}, {'l': '5 kg'}])
    render_pouch(p, 'test_pouch.jpg')
