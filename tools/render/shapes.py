from engine import *
from PIL import ImageFilter
from scipy.interpolate import PchipInterpolator

CX = W * .5
INK = (29, 27, 23)


def rowfn(pts, y0, y1):
    ys, rs = zip(*pts)
    f = PchipInterpolator(np.array(ys, np.float32) * SS, np.array(rs, np.float32) * SS, extrapolate=False)
    yv = np.arange(H, dtype=np.float32)
    r = f(yv); r = np.where(np.isnan(r), 0, r)
    r[(yv < y0 * SS) | (yv > y1 * SS)] = 0
    return r.astype(np.float32)


# ---------------- label art for cylindrical vessels ----------------
def vessel_label(p, TW=620, TH=700, paper=(247, 240, 222)):
    c1, c2 = (hexc(p['c1']) * 255).astype(int), (hexc(p['c2']) * 255).astype(int)
    img = Image.new('RGB', (TW, TH), paper); d = ImageDraw.Draw(img)
    d.rectangle((0, 0, TW, 36), fill=tuple(c2)); d.rectangle((0, TH - 36, TW, TH), fill=tuple(c2))
    cx = TW // 2
    if p.get('photo'):
        circle_photo(img, p['photo'], cx, 210, 150, tuple(c2), 7)
    else:
        d.ellipse((cx - 150, 60, cx + 150, 360), fill=tuple((np.array(c1) * .25 + 255 * .75).astype(int)), outline=tuple(c2), width=7)
        d.polygon([(cx, 98), (cx + 52, 229), (cx - 52, 229)], fill=tuple(c2))
        d.ellipse((cx - 56, 194, cx + 56, 306), fill=tuple(c2))
        d.ellipse((cx - 32, 238, cx - 12, 276), fill=tuple(np.clip(np.array(c1) * 1.0 + 40, 0, 255).astype(int)))
    lg = logo_img(38); img.paste(lg, (cx - 112, 400 - 19), lg)
    center_text(d, (cx + 16, 400), 'GEO EXCEL', ImageFont.truetype(INTER_B, 24), INK, tracking=7)
    f = lora(64)
    d.text((cx, 468), p['short'][0], font=f, fill=INK, anchor='mm'); d.text((cx, 538), p['short'][1], font=f, fill=INK, anchor='mm')
    center_text(d, (cx, 595), p['tag'].upper(), ImageFont.truetype(INTER_S, 21), tuple((np.array(c2) * .85).astype(int)), tracking=4)
    center_text(d, (cx, 636), p['sizes'][min(1, len(p['sizes']) - 1)]['l'].upper(), ImageFont.truetype(INTER_S, 26), (255, 255, 255), tracking=6)
    return np.asarray(img, np.float32) / 255.


def render_vessel(p, out, cfg):
    """cfg: pts, y0(cap top), cap=(y0,y1,r), band=(y0,y1,r), fill_y, mode('oil'|'ghee'), label=(y0,y1), base_y"""
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    c1 = hexc(p['c1'])
    rg = rowfn(cfg['pts'], cfg['pts'][0][0], cfg['base_y'])[:, None]
    cy0, cy1, cr = cfg['cap']; by0, by1, br = cfg['band']
    yv = yy[:, :1]
    capr = np.where((yv >= cy0 * SS) & (yv < cy1 * SS), cr * SS * np.sqrt(np.clip(1 - np.clip((cy0 + 22) * SS - yv, 0, None) ** 2 / (22 * SS) ** 2, 0, 1)), 0)
    bandr = np.where((yv >= by0 * SS) & (yv < by1 * SS), br * SS, 0)
    R = np.maximum(np.maximum(rg, capr), bandr)
    u = (xx - CX) / np.maximum(R, 1)
    inside = (np.abs(u) <= 1) & (R > 0)
    mask = inside.astype(np.float32)
    uc = np.clip(u, -1, 1)
    z = R * np.sqrt(1 - uc ** 2)
    iscap = (capr > 0) & (capr >= rg) & (capr >= bandr)
    isband = (bandr > 0) & (bandr >= rg) & ~iscap
    z = z + (1.3 * SS * np.sin((xx - CX) / (3.6 * SS))) * iscap
    z = blur(z, .8)
    n = normals_from_z(z, 1.0)
    # --- opaque materials: cap, foil band, label
    ly0, ly1 = cfg['label']
    inlabel = (yy >= ly0 * SS) & (yy < ly1 * SS) & inside & ~iscap & ~isband
    phi = 1.25
    s = np.arcsin(np.clip(uc * np.sin(phi), -1, 1)) / phi
    art = vessel_label(p)
    TH, TW = art.shape[:2]
    alb_lab = sample(art, (s * .5 + .5) * (TW - 1), np.clip((yy - ly0 * SS) / ((ly1 - ly0) * SS), 0, 1) * (TH - 1))
    alb = np.where(inlabel[..., None], alb_lab, 0.0)
    cap_c = np.array(cfg.get('cap_col', (.06, .06, .07)), np.float32)
    alb = np.where(iscap[..., None], cap_c, alb)
    alb = np.where(isband[..., None], np.array([.86, .66, .27], np.float32), alb)
    opaque = inlabel | iscap | isband
    rough = np.where(inlabel, .62, np.where(isband, .24, .34)).astype(np.float32)
    spec = np.where(inlabel, .18, np.where(isband, 1.0, .75)).astype(np.float32)
    metal = np.where(isband, .9, 0.0).astype(np.float32)
    # curl shading on the label edges
    ao = (1 - .35 * ss(.72, 1, np.abs(uc))).astype(np.float32)
    col_op = shade(alb, n, rough, spec, metal, ao)
    # --- glass + contents
    bg = studio_bg(c1)
    fill_y = cfg['fill_y'] * SS
    r_in = np.maximum(R - 9 * SS, 1)
    uin = (xx - CX) / r_in
    liquid = (np.abs(uin) < 1) & (yy >= fill_y) & (yy < (cfg['base_y'] - 12) * SS) & ~opaque & inside
    zin = r_in * np.sqrt(np.clip(1 - uin ** 2, 0, 1))
    thick = zin * 2 / (150 * SS) * 1.15
    behind = bg * (.97)
    if cfg['mode'] == 'oil':
        k = np.array([.17, .58, 3.1], np.float32)
        liq = behind * np.exp(-k[None, None, :] * thick[..., None]) + np.array([.55, .38, .02], np.float32) * (.10 + .10 * np.clip(n[..., 0] * -1, 0, 1))[..., None]
        liq = liq * 1.08
        # light focusing: brighter inner edge band + caustic-looking bottom
        liq += np.array([.9, .62, .05], np.float32) * (.18 * ss(.55, .9, np.abs(uin)) * ss(.2, 1, -n[..., 0] * np.sign(uin)))[..., None]
    else:  # ghee: opaque, creamy golden, granular
        g = noise((H, W), 3 * SS, seed=11) * .008 + noise((H, W), 14 * SS, seed=12) * .02
        alb_g = (np.array([.95, .66, .13], np.float32)[None, None, :] + g[..., None] * np.array([1, 1.1, .8], np.float32))
        nl = normals_from_z(zin + noise((H, W), 6 * SS, seed=13) * .25 * SS, 1.0)
        liq = shade(np.clip(alb_g, 0, 1), nl, np.full((H, W), .45, np.float32), np.full((H, W), .25, np.float32), np.zeros((H, W), np.float32), np.ones((H, W), np.float32)) * 1.02
        liq *= (1 - .25 * ss(.7, 1, np.abs(uin)))[..., None]
    air = behind * np.array([.96, 1.0, .97], np.float32)
    glass_col = np.where(liquid[..., None], liq, air)
    # glass wall thickness: dark/green rim, refraction-darkening
    wall = ss(.80, 1.0, np.abs(uc))
    glass_col = glass_col * (1 - .55 * wall)[..., None] + (np.array([.10, .20, .16], np.float32) * wall[..., None] * .5)
    # sharp environment reflections
    rx, ry = 2 * n[..., 2] * n[..., 0], 2 * n[..., 2] * n[..., 1]
    E = env(rx, ry, np.full((H, W), .02, np.float32))
    fres = .06 + .94 * (1 - n[..., 2]) ** 4
    glass_col = glass_col + (E * (fres * 1.0 + .10))[..., None] * 1.0
    # meniscus + base thickness
    glass_col += (.22 * np.exp(-((yy - fill_y) / (3.2 * SS)) ** 2) * (np.abs(uin) < 1))[..., None] * np.array([1, .85, .5], np.float32) * (liquid | (yy < fill_y + 4 * SS))[..., None]
    bt = ss((cfg['base_y'] - 26) * SS, (cfg['base_y'] - 4) * SS, yy)
    glass_col = glass_col * (1 - .35 * bt)[..., None]
    col = np.where(opaque[..., None], col_op, glass_col)
    # --- shadows
    base = cfg['base_y'] * SS
    sh = shadows(mask, base - 2 * SS, CX - R.max() * .95, CX + R.max() * .95, cast=.13 if cfg['mode'] == 'oil' else .26, contact=.5)
    img = compose(col, mask, bg, sh, reflect=.22, ybase=base)
    if cfg['mode'] == 'oil':   # warm caustic on the floor, right of the bottle
        liqm = liquid.astype(np.float32)
        M = np.float32([[1, -.60, .60 * base], [0, .16, base * (1 - .16)]])
        cs = blur(cv2.warpAffine(liqm, M, (W, H)), 14 * SS) * (1 - np.clip(mask, 0, 1))
        img = img + np.array([.75, .42, .0], np.float32) * (cs * .22)[..., None]
    finish(img, out)


BOTTLE = dict(pts=[(236, 44), (270, 44), (292, 48), (322, 66), (362, 102), (408, 136), (452, 150), (900, 150), (922, 142), (934, 122), (940, 100)],
              cap=(104, 212, 54), band=(212, 238, 47), fill_y=345, mode='oil', label=(528, 862), base_y=940, cap_col=(.05, .05, .055))
JAR = dict(pts=[(300, 214), (330, 224), (350, 236), (380, 248), (420, 252), (900, 252), (922, 246), (934, 230), (940, 210)],
           cap=(212, 322, 262), band=(322, 334, 252), fill_y=345, mode='ghee', label=(500, 850), base_y=940, cap_col=(.07, .065, .06))


# ---------------- carton (IQF) ----------------
def quad_warp(tex, quad, size=(W, H)):
    h, w = tex.shape[:2]
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    M = cv2.getPerspectiveTransform(src, np.float32(quad))
    return cv2.warpPerspective(tex, M, size, flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)


def poly_mask(quad):
    m = np.zeros((H, W), np.float32); cv2.fillConvexPoly(m, np.int32(np.array(quad) * 1), 1.0, cv2.LINE_AA); return m


def snow(d, cx, cy, r, col, w):
    for i in range(3):
        a = np.pi / 3 * i
        dx, dy = r * np.sin(a), r * np.cos(a)
        d.line((cx - dx, cy - dy, cx + dx, cy + dy), fill=col, width=w)
        for sgn in (1, -1):
            px, py = cx + sgn * dx * .6, cy + sgn * dy * .6
            for b in (-.6, .6):
                ex, ey = np.sin(a + b) * r * .28 * sgn, np.cos(a + b) * r * .28 * sgn
                d.line((px, py, px + ex, py + ey), fill=col, width=w)


def carton_front(p, TW=800, TH=1000):
    c1, c2 = hexc(p['c1']), hexc(p['c2'])
    yy = np.linspace(0, 1, TH, dtype=np.float32)[:, None, None]
    base = c1 * (1 - yy) + c2 * yy
    img = Image.fromarray((np.clip(base * np.ones((TH, TW, 3), np.float32), 0, 1) * 255).astype(np.uint8)); d = ImageDraw.Draw(img)
    cx = TW // 2
    d.rounded_rectangle((60, 220, TW - 60, TH - 90), 40, fill=(251, 246, 234))
    d.ellipse((cx - 150, 250, cx + 150, 550), fill=tuple((c1 * 255 * .22 + 255 * .78).astype(int)), outline=tuple((c2 * 255).astype(int)), width=8)
    snow(d, cx, 400, 105, tuple((c2 * 255).astype(int)), 11)
    lg = logo_img(42); img.paste(lg, (cx - 118, 610 - 21), lg)
    center_text(d, (cx + 16, 610), 'GEO EXCEL', ImageFont.truetype(INTER_B, 26), INK, tracking=7)
    f = lora(74)
    d.text((cx, 690), p['short'][0], font=f, fill=INK, anchor='mm'); d.text((cx, 770), p['short'][1], font=f, fill=INK, anchor='mm')
    center_text(d, (cx, 836), p['tag'].upper(), ImageFont.truetype(INTER_S, 22), tuple((c2 * 255 * .8).astype(int)), tracking=4)
    d.rounded_rectangle((cx - 150, 60, cx + 150, 130), 35, fill=INK)
    center_text(d, (cx, 95), 'KEEP FROZEN  -18 C', ImageFont.truetype(INTER_B, 24), (255, 255, 255), tracking=3)
    d.text((cx, TH - 55), 'NET ' + p['sizes'][min(1, len(p['sizes']) - 1)]['l'].upper(), font=ImageFont.truetype(INTER_S, 28), fill=(255, 255, 255), anchor='mm')
    return np.asarray(img, np.float32) / 255.


def carton_side(p, TW=520, TH=1000):
    c1, c2 = hexc(p['c1']), hexc(p['c2'])
    yy = np.linspace(0, 1, TH, dtype=np.float32)[:, None, None]
    base = (c1 * (1 - yy) + c2 * yy) * np.ones((TH, TW, 3), np.float32)
    img = Image.fromarray((np.clip(base, 0, 1) * 255).astype(np.uint8)); d = ImageDraw.Draw(img)
    cx = TW // 2
    lg = logo_img(150).rotate(90); img.paste(lg, (cx - 75, 150), lg)
    t = Image.new('RGBA', (700, 90), (0, 0, 0, 0)); td = ImageDraw.Draw(t)
    td.text((350, 45), 'GEO EXCEL', font=ImageFont.truetype(INTER_B, 58), fill=(255, 255, 255, 235), anchor='mm')
    t = t.rotate(90, expand=True); img.paste(t, (cx - 45, 330), t)
    snow(d, cx, 920, 40, (255, 255, 255), 6)
    return np.asarray(img, np.float32) / 255.


def render_carton(p, out, seed=5):
    c1 = hexc(p['c1'])
    bg = studio_bg(c1)
    S = SS
    F = [(250 * S, 330 * S), (650 * S, 330 * S), (650 * S, 920 * S), (250 * S, 920 * S)]
    Sd = [(650 * S, 330 * S), (790 * S, 270 * S), (790 * S, 868 * S), (650 * S, 920 * S)]
    Tp = [(250 * S, 330 * S), (390 * S, 270 * S), (790 * S, 270 * S), (650 * S, 330 * S)]
    ft, st = carton_front(p), carton_side(p)
    top_tex = np.ones((200, 800, 3), np.float32) * ((hexc(p['c1']) * .85 + .15)[None, None, :])
    tt = Image.fromarray((top_tex * 255).astype(np.uint8)); dd = ImageDraw.Draw(tt)
    dd.line((0, 100, 800, 100), fill=(0, 0, 0), width=3); tt = np.asarray(tt, np.float32) / 255.
    layers = []
    for tex, q, k in ((ft, F, 1.0), (st, Sd, .60), (tt, Tp, 1.12)):
        im = quad_warp(tex, q); m = poly_mask(q)
        layers.append((im, m, k))
    col = np.zeros((H, W, 3), np.float32); mask = np.zeros((H, W), np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    for im, m, k in layers:
        # paper fibre + soft print gloss
        fib = 1 + noise((H, W), 1.3, seed=seed) * .012 + noise((H, W), 60 * S, 140 * S, seed=seed + 1) * .015
        shade_k = k * fib
        if k == 1.0:
            gx = (xx - 250 * S) / (400 * S); gy = (yy - 330 * S) / (590 * S)
            shade_k = shade_k * (1.10 - .22 * gx - .10 * gy)
            gloss = .13 * ss(.25, .55, gx - gy * .6) * ss(.85, .55, gx - gy * .6)
            im = im + gloss[..., None] * 1.0
        elif k < 1:
            gy = (yy - 270 * S) / (650 * S); shade_k = shade_k * (1.02 - .22 * gy)
        col = col * (1 - m[..., None]) + im * shade_k[..., None] * m[..., None]
        mask = np.maximum(mask, m)
    # edge bevel highlights + creases
    def edge(a, b, w, inten, color=1.0):
        l = np.zeros((H, W), np.float32); cv2.line(l, (int(a[0]), int(a[1])), (int(b[0]), int(b[1])), 1.0, int(w), cv2.LINE_AA); return blur(l, 1.6 * S) * inten * color
    hl = edge(F[1], F[2], 3 * S, .5) + edge(F[0], F[1], 3 * S, .6) + edge(Sd[1], Sd[2], 2 * S, .18) + edge(F[0], F[3], 3 * S, .25)
    dk = edge(F[1], F[2], 6 * S, .0)
    col = col + hl[..., None] * .55
    # contact darkening toward the floor, front face AO
    ao = 1 - .18 * ss(840 * S, 925 * S, yy) * mask
    col = col * ao[..., None]
    base = 920 * S
    sh = shadows(mask, base - 4 * S, 250 * S, 790 * S, cast=.34, contact=.7)
    img = compose(col, mask, bg, sh, reflect=.06, ybase=base)
    finish(img, out)


# ---------------- fabric goods ----------------
def weave_bump(seed, period=5.0):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    P = period * SS
    w = np.sin(2 * np.pi * xx / P) * np.sin(2 * np.pi * yy / P)
    return (w * .8 + noise((H, W), 1.0 * SS, seed=seed) * .35)


def strap(poly, width, seed):
    m = np.zeros((H, W), np.uint8)
    cv2.polylines(m, [np.int32(poly)], False, 255, int(width), cv2.LINE_AA)
    mb = (m > 127).astype(np.uint8)
    d = cv2.distanceTransform(mb, cv2.DIST_L2, 5)
    t = 1 - np.clip(d / (width / 2), 0, 1)
    z = (width / 2) * .75 * np.sqrt(np.clip(1 - t ** 2, 0, 1)) * mb
    return mb.astype(np.float32), z


def bez(p0, p1, p2, n=80):
    t = np.linspace(0, 1, n)[:, None]
    return ((1 - t) ** 2) * np.array(p0) + 2 * (1 - t) * t * np.array(p1) + (t ** 2) * np.array(p2)


def render_tote(p, out, seed=7):
    c1, c2 = hexc(p['c1']), hexc(p['c2'])
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    bg = studio_bg(c1)
    top, bot = 372 * SS, 940 * SS
    v = (yy - top) / (bot - top)
    hw = (252 + 26 * np.clip(v, 0, 1) ** 1.2 + 10 * np.sin(np.pi * np.clip(v, 0, 1))) * SS
    u = (xx - CX) / hw
    mask = ((np.abs(u) <= 1) & (yy >= top) & (yy <= bot)).astype(np.uint8)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * 16 * SS + 1,) * 2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, k).astype(np.float32)
    uc = np.clip(u, -1, 1)
    z = 105 * SS * (.55 + .45 * ss(0, .5, v)) * (1 - uc ** 2) ** .45
    z = z + (np.sin(uc * 6.5 + noise((H, W), 80 * SS, seed=seed) * 1.5) * 5 * ss(.65, 0, v) + noise((H, W), 40 * SS, 120 * SS, seed=seed + 1) * 4 + noise((H, W), 10 * SS, 40 * SS, seed=seed + 2) * 1.0) * SS
    z = blur(z, 2 * SS) + weave_bump(seed, 5) * .8 * SS
    # back panel visible through the opening
    inner = ((yy >= (top - 20 * SS)) & (yy < top + 2 * SS) & (np.abs(xx - CX) < (236 * SS)))
    mask = np.maximum(mask, inner.astype(np.float32))
    # straps (back one first, behind the bag)
    sw = 38 * SS
    pb = bez((CX - 118 * SS, top - 4 * SS), (CX, -130 * SS), (CX + 118 * SS, top - 4 * SS)) + np.array([0, -4 * SS])
    pf = bez((CX - 128 * SS, top + 40 * SS), (CX, -90 * SS), (CX + 128 * SS, top + 40 * SS))
    mb, zb = strap(pb, sw * .9, seed); mf, zf = strap(pf, sw, seed)
    mf = mf * 1.0
    # ---- albedo
    nat = np.array([.90, .85, .74], np.float32)
    slub = 1 + noise((H, W), 1.2 * SS, seed=seed + 4) * .02 + noise((H, W), 2 * SS, 40 * SS, seed=seed + 5) * .025
    alb = nat[None, None, :] * slub[..., None]
    hem = (yy >= top) & (yy < top + 34 * SS)
    alb = np.where(hem[..., None], c1 * .95, alb)
    stripe = ((yy >= top + 40 * SS) & (yy < top + 46 * SS))
    alb = np.where(stripe[..., None], c2 * .9, alb)
    # print: logo + name
    pr = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(pr)
    lg = logo_img(200 * SS); pr.paste(lg, (int(CX - 100 * SS), int(510 * SS)), lg)
    d.text((CX, 760 * SS), p['short'][0], font=lora(64 * SS), fill=(40, 36, 30, 255), anchor='mm')
    d.text((CX, 760 * SS + 68 * SS), p['short'][1], font=lora(64 * SS), fill=(40, 36, 30, 255), anchor='mm')
    center_text(d, (CX, 902 * SS), 'GEO EXCEL', ImageFont.truetype(INTER_B, 24 * SS), (90, 82, 70, 255), tracking=8 * SS)
    pr = np.asarray(pr, np.float32) / 255.
    pa = pr[..., 3:4] * (.95 * ss(0, .06, 1 - np.abs(uc)))[..., None]
    alb = alb * (1 - pa) + pr[..., :3] * pa
    # straps colour
    strap_alb = (c2 * .85)[None, None, :] * (1 + noise((H, W), 1.0 * SS, seed=seed + 8) * .03)[..., None]
    zz = np.where(mf > 0, 18 * SS + zf, z)
    zz = np.where((mb > 0) & (mf == 0), 4 * SS + zb, zz)
    n = normals_from_z(blur(zz, 1.0), 1.0)
    nb = normals_from_z(blur(np.where(mb > 0, zb, 0), 1.0), 1.0)
    # stitched patches where the front strap meets the bag
    for sx in (-128, 128):
        x0, x1 = int(CX + (sx - 26) * SS), int(CX + (sx + 26) * SS); y0, y1 = int(top + 6 * SS), int(top + 96 * SS)
        cv2.rectangle(alb, (x0, y0), (x1, y1), tuple((c2 * .95).tolist()), -1)
        for t in range(x0 + 4 * SS, x1 - 4 * SS, 9 * SS): cv2.line(alb, (t, y0 + 5 * SS), (t + 5 * SS, y0 + 5 * SS), (.95, .93, .88), SS)
        for t in range(x0 + 4 * SS, x1 - 4 * SS, 9 * SS): cv2.line(alb, (t, y1 - 5 * SS), (t + 5 * SS, y1 - 5 * SS), (.95, .93, .88), SS)
        for t in range(y0 + 4 * SS, y1 - 4 * SS, 9 * SS): cv2.line(alb, (x0 + 5 * SS, t), (x0 + 5 * SS, t + 5 * SS), (.95, .93, .88), SS)
        for t in range(y0 + 4 * SS, y1 - 4 * SS, 9 * SS): cv2.line(alb, (x1 - 5 * SS, t), (x1 - 5 * SS, t + 5 * SS), (.95, .93, .88), SS)
    alb_all = np.where((mf > 0)[..., None], strap_alb, alb)
    alb_all = np.where(((mb > 0) & (mf == 0))[..., None], strap_alb * .72, alb_all)
    inner_only = inner & ~(mask - inner.astype(np.float32) > 0) & (yy < top)
    alb_all = np.where(inner_only[..., None], nat[None, None, :] * .55, alb_all)
    ao = np.clip(1 - .5 * ss(.0, 1.0, (blur(z, 24 * SS) - z) / (14 * SS)), .5, 1) * (1 - .35 * ss(.78, 1, np.abs(uc)))
    ao = np.where((mf == 0) & (mb == 0) & (yy < top + 10 * SS), ao * .7, ao)
    # shadow of the front strap onto the bag
    sh_s = blur(np.roll(np.roll(mf, 10 * SS, 0), 6 * SS, 1), 6 * SS) * (1 - mf) * (mask > 0)
    ao = ao * (1 - .35 * sh_s)
    nn = np.where((mf > 0)[..., None], n, n)
    col = shade(alb_all, nn, np.full((H, W), .9, np.float32), np.full((H, W), .05, np.float32), np.zeros((H, W), np.float32), ao.astype(np.float32))
    mask_all = np.maximum(np.maximum(mask, mf), mb)
    base = bot
    sh = shadows(mask_all, base - 4 * SS, CX - 270 * SS, CX + 270 * SS, cast=.30, contact=.6)
    img = compose(col, mask_all, bg, sh)
    finish(img, out)


def render_stole(p, out, seed=9):
    c1, c2 = hexc(p['c1']), hexc(p['c2'])
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    bg = studio_bg(c1)
    x0, x1, y0, bh, nb = 215 * SS, 785 * SS, 330 * SS, 200 * SS, 3
    y1 = y0 + bh * nb
    mask = ((xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1)).astype(np.uint8)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * 12 * SS + 1,) * 2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, k).astype(np.float32)
    yw = yy + 7 * SS * np.sin(xx / (95 * SS) + 1.0) + 3 * SS * np.sin(xx / (31 * SS))
    band = np.clip(np.floor((yw - y0) / bh), 0, nb - 1)
    t = np.clip((yw - y0 - band * bh) / bh, 0, 1)
    ux = np.clip((xx - x0) / (x1 - x0) * 2 - 1, -1, 1)
    z = (46 * SS * np.clip(np.sin(np.pi * t), 0, 1) ** .55 + band * 6 * SS) * np.clip(ss(0, .10, 1 - np.abs(ux)), 0, 1) ** .5
    z = z + (noise((H, W), 40 * SS, 16 * SS, seed=seed) * 1.6 + noise((H, W), 9 * SS, 3 * SS, seed=seed + 1) * .35) * SS
    z = z + weave_bump(seed, 4.5) * .7 * SS
    # fabric albedo: cream field with coloured border stripes near each fold
    cream = np.array([.93, .88, .78], np.float32)
    field = (c1 * .52 + cream * .48).astype(np.float32)
    alb = field[None, None, :] * (1 + noise((H, W), 1.0 * SS, seed=seed + 3) * .025 + noise((H, W), 3 * SS, 50 * SS, seed=seed + 4) * .03)[..., None]
    tt = t
    s1 = (tt < .06) | (tt > .94)
    s2 = ((tt >= .07) & (tt < .085)) | ((tt > .915) & (tt <= .93))
    alb = np.where(s1[..., None], cream * .97, alb)
    alb = np.where(s2[..., None], c2 * .95, alb)
    # warp lines (vertical fine stripes)
    wl = (np.sin(xx / (9 * SS) + noise((H, W), 80 * SS, seed=seed + 6) * 2) > .92) * .05
    alb = alb * (1 - wl[..., None])
    # fringe on right edge of the top band
    fr = np.zeros((H, W), np.float32); rs = np.random.RandomState(seed)
    for y in np.arange(y0 + 8 * SS, y0 + bh - 8 * SS, 3.2 * SS):
        L = (64 + rs.rand() * 10) * SS; cur = np.clip(rs.randn(), -1.2, 1.2) * 6 * SS
        pts = np.array([[x1 - 6 * SS, y], [x1 + L * .5, y + cur * .5], [x1 + L, y + cur]], np.float32)
        cv2.polylines(fr, [np.int32(pts)], False, 1.0, max(1, int(2.2 * SS)), cv2.LINE_AA)
    fr = fr * (xx > x1 - 4 * SS)
    mask_all = np.maximum(mask, fr)
    zf = np.where(fr > 0, 5 * SS + noise((H, W), 2 * SS, seed=seed + 7) * 1.5 * SS, z)
    zz = np.where(mask > 0, z, zf)
    n = normals_from_z(blur(zz, 1.0), 1.0)
    alb_all = np.where(((fr > 0) & (mask == 0))[..., None], (field * .9 + cream * .1)[None, None, :], alb)
    # creases between bands (AO) + soft overall occlusion
    crease = np.exp(-((tt - 0) / .035) ** 2) + np.exp(-((tt - 1) / .035) ** 2)
    ao = np.clip(1 - .38 * crease - .30 * ss(.85, 1, np.abs(ux)), .5, 1)
    ao = ao * np.clip(1 - .4 * ss(0, 1, (blur(zz, 22 * SS) - zz) / (14 * SS)), .6, 1)
    ao = np.where(fr > 0, .8, ao)
    col = shade(alb_all, n, np.full((H, W), .9, np.float32), np.full((H, W), .05, np.float32), np.zeros((H, W), np.float32), ao.astype(np.float32))
    base = y1
    sh = shadows(mask, base - 3 * SS, x0, x1, cast=.30, contact=.55)
    img = compose(col, mask_all, bg, sh)
    finish(img, out)
