import json, sys, os
from multiprocessing import Pool
sys.path.insert(0, '.')
from shapes import *
from pouch import render_pouch
OUT = '/home/claude/geoexcel/assets/packs/'
def job(p):
    p = dict(p); p['photo'] = os.path.basename(p['photo']) if p.get('photo') else None
    o = OUT + p['id'] + '.jpg'
    t = p['pack']
    if t == 'pouch': render_pouch(p, o)
    elif t == 'bottle': render_vessel(p, o, BOTTLE)
    elif t == 'jar': render_vessel(p, o, JAR)
    elif t == 'carton': render_carton(p, o)
    elif t == 'tote': (render_stole if 'stole' in p['id'] else render_tote)(p, o)
    return p['id']
if __name__ == '__main__':
    ps = json.load(open('products.json'))
    if len(sys.argv) > 1: ps = [p for p in ps if p['id'] in sys.argv[1:]]
    with Pool(2) as pool:
        for r in pool.imap_unordered(job, ps): print('done', r, flush=True)
