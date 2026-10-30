/* Procedurally generated packaging renders (inline SVG). Uses the original photos + logo untouched on the labels. */
(function () {
  var n = 0;
  var INK = '#1d1b17', PAPER = '#fffaf0';

  function glyph(kind, cx, cy, r, color) {
    if (kind === 'snow') {
      var s = '';
      for (var i = 0; i < 3; i++) s += '<line x1="' + cx + '" y1="' + (cy - r) + '" x2="' + cx + '" y2="' + (cy + r) + '" transform="rotate(' + i * 60 + ' ' + cx + ' ' + cy + ')"/>';
      for (var j = 0; j < 6; j++) s += '<path d="M' + cx + ' ' + (cy - r * .55) + ' l-' + r * .16 + ' -' + r * .2 + 'M' + cx + ' ' + (cy - r * .55) + ' l' + r * .16 + ' -' + r * .2 + '" transform="rotate(' + j * 60 + ' ' + cx + ' ' + cy + ')"/>';
      return '<g stroke="' + color + '" stroke-width="3.5" stroke-linecap="round" fill="none">' + s + '</g>';
    }
    if (kind === 'drop') {
      return '<path d="M' + cx + ' ' + (cy - r) + ' C' + (cx + r * 1.1) + ' ' + (cy - r * .1) + ' ' + (cx + r * .8) + ' ' + (cy + r) + ' ' + cx + ' ' + (cy + r) + ' C' + (cx - r * .8) + ' ' + (cy + r) + ' ' + (cx - r * 1.1) + ' ' + (cy - r * .1) + ' ' + cx + ' ' + (cy - r) + 'Z" fill="' + color + '"/>';
    }
    if (kind === 'logo') {
      return '<image href="assets/logo.png" x="' + (cx - r) + '" y="' + (cy - r) + '" width="' + r * 2 + '" height="' + r * 2 + '"/>';
    }
    return '';
  }

  /* label medallion: photo if present, otherwise glyph on tinted disc */
  function medallion(p, u, cx, cy, r) {
    var cp = 'cl' + u;
    if (p.photo) {
      return '<clipPath id="' + cp + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath>' +
        '<image href="' + p.photo + '" x="' + (cx - r * 1.4) + '" y="' + (cy - r * 1.4) + '" width="' + r * 2.8 + '" height="' + r * 2.8 + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#' + cp + ')"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.c2 + '" stroke-width="3"/>';
    }
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + p.c1 + '" opacity=".22"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + p.c2 + '" stroke-width="3"/>' +
      glyph(p.glyph || 'drop', cx, cy, r * .5, p.c2);
  }

  function labelText(p, x, y, size) {
    return '<text x="' + x + '" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-weight="700" fill="' + INK + '" font-size="' + size + '">' +
      '<tspan x="' + x + '" y="' + y + '">' + p.short[0] + '</tspan><tspan x="' + x + '" y="' + (y + size * 1.15) + '">' + p.short[1] + '</tspan></text>';
  }

  function brandRow(x, y) {
    return '<image href="assets/logo.png" x="' + (x - 62) + '" y="' + (y - 14) + '" width="22" height="22"/>' +
      '<text x="' + (x - 36) + '" y="' + (y + 2) + '" font-family="Inter,system-ui,sans-serif" font-weight="700" font-size="11" letter-spacing="2.4" fill="' + INK + '">GEO EXCEL</text>';
  }

  function size(p, x, y) {
    var s = p.sizes[Math.min(1, p.sizes.length - 1)].l;
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="600" font-size="11" letter-spacing="1.6" fill="' + INK + '" opacity=".65">NET ' + s.toUpperCase() + '</text>';
  }

  var shapes = {
    pouch: function (p, u) {
      var seal = '';
      for (var i = 0; i < 18; i++) seal += '<line x1="' + (96 + i * 12) + '" y1="72" x2="' + (96 + i * 12) + '" y2="100" />';
      return '<path d="M92 66 L308 66 L328 442 Q200 470 72 442 Z" fill="url(#g' + u + ')"/>' +
        '<rect x="92" y="66" width="216" height="38" fill="#fff" opacity=".14"/><g stroke="#000" stroke-opacity=".14" stroke-width="1.5">' + seal + '</g>' +
        '<line x1="86" y1="122" x2="314" y2="122" stroke="#fff" stroke-opacity=".4" stroke-width="2.5"/>' +
        '<rect x="106" y="146" width="188" height="262" rx="22" fill="' + PAPER + '"/>' +
        medallion(p, u, 200, 226, 62) +
        brandRow(200, 318) + labelText(p, 200, 346, 21) + size(p, 200, 392) +
        '<path d="M92 66 L150 66 L170 450 L72 442 Z" fill="url(#s' + u + ')"/>';
    },
    bottle: function (p, u) {
      var body = 'M176 66 H224 V150 C224 178 282 190 282 244 V424 Q282 452 254 452 H146 Q118 452 118 424 V244 C118 190 176 178 176 150 Z';
      return '<clipPath id="bd' + u + '"><path d="' + body + '"/></clipPath>' +
        '<path d="' + body + '" fill="#fff" opacity=".35"/>' +
        '<g clip-path="url(#bd' + u + ')"><rect x="100" y="150" width="200" height="320" fill="url(#g' + u + ')"/>' +
        '<ellipse cx="200" cy="150" rx="40" ry="6" fill="#fff" opacity=".35"/></g>' +
        '<path d="' + body + '" fill="none" stroke="' + p.c2 + '" stroke-opacity=".6" stroke-width="3"/>' +
        '<rect x="170" y="32" width="60" height="38" rx="7" fill="#2b2a26"/><g stroke="#fff" stroke-opacity=".18" stroke-width="2"><line x1="180" y1="38" x2="180" y2="64"/><line x1="190" y1="38" x2="190" y2="64"/><line x1="200" y1="38" x2="200" y2="64"/><line x1="210" y1="38" x2="210" y2="64"/><line x1="220" y1="38" x2="220" y2="64"/></g>' +
        '<rect x="128" y="268" width="144" height="150" rx="12" fill="' + PAPER + '"/>' +
        medallion(p, u, 200, 312, 34) + labelText(p, 200, 368, 15) +
        '<text x="200" y="404" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="700" font-size="8.5" letter-spacing="2" fill="' + INK + '" opacity=".6">GEO EXCEL</text>' +
        '<path d="M134 250 C134 214 150 196 166 188" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M139 272 V420" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/>';
    },
    jar: function (p, u) {
      return '<rect x="102" y="104" width="196" height="340" rx="40" fill="url(#g' + u + ')"/>' +
        '<rect x="102" y="104" width="196" height="340" rx="40" fill="#fff" opacity=".12"/>' +
        '<rect x="112" y="64" width="176" height="52" rx="14" fill="#2b2a26"/><rect x="112" y="64" width="176" height="14" rx="7" fill="#fff" opacity=".12"/>' +
        '<rect x="102" y="212" width="196" height="178" fill="' + PAPER + '"/>' +
        medallion(p, u, 200, 262, 34) + labelText(p, 200, 322, 20) + brandRow(200, 372) +
        '<path d="M120 150 V420" stroke="#fff" stroke-opacity=".5" stroke-width="7" stroke-linecap="round"/>';
    },
    carton: function (p, u) {
      return '<polygon points="78,160 292,160 292,446 78,446" fill="url(#g' + u + ')"/>' +
        '<polygon points="292,160 336,126 336,412 292,446" fill="#000" opacity=".28"/>' +
        '<polygon points="292,160 336,126 336,412 292,446" fill="url(#g' + u + ')" opacity=".7"/>' +
        '<polygon points="78,160 122,126 336,126 292,160" fill="#fff" opacity=".28"/>' +
        '<polygon points="78,160 122,126 336,126 292,160" fill="url(#g' + u + ')" opacity=".6"/>' +
        '<rect x="98" y="196" width="174" height="214" rx="16" fill="' + PAPER + '"/>' +
        medallion(p, u, 185, 258, 42) +
        brandRow(185, 330) + labelText(p, 185, 354, 19) + size(p, 185, 396) +
        '<rect x="104" y="168" width="88" height="20" rx="10" fill="' + INK + '"/><text x="148" y="182" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="700" font-size="9.5" letter-spacing="1.6" fill="#fff">KEEP FROZEN</text>';
    },
    tote: function (p, u) {
      var st = '';
      for (var i = 0; i < 2; i++) st += '<line x1="' + (110 + i * 180) + '" y1="150" x2="' + (96 + i * 208) + '" y2="436" stroke-dasharray="6 6"/>';
      return '<path d="M138 158 C130 40 270 40 262 158" fill="none" stroke="' + p.c2 + '" stroke-width="12" stroke-linecap="round"/>' +
        '<path d="M88 150 H312 L336 446 H64 Z" fill="#e9dfca"/>' +
        '<path d="M88 150 H312 L336 446 H64 Z" fill="url(#g' + u + ')" opacity=".16"/>' +
        '<g stroke="#000" stroke-opacity=".18" stroke-width="2" fill="none">' + st + '</g>' +
        '<rect x="88" y="150" width="224" height="16" fill="' + p.c1 + '" opacity=".9"/>' +
        '<image href="assets/logo.png" x="170" y="220" width="60" height="60"/>' +
        labelText(p, 200, 322, 21) +
        '<text x="200" y="384" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="700" font-size="11" letter-spacing="3" fill="' + INK + '" opacity=".6">GEO EXCEL</text>' +
        '<path d="M88 150 L140 150 L152 446 L64 446 Z" fill="url(#s' + u + ')"/>';
    }
  };

  window.GXPackSVG = function (p) {
    var u = ++n;
    return '<svg class="pack" viewBox="0 0 400 500" role="img" aria-label="' + p.name + ' packaging" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="g' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p.c1 + '"/><stop offset="1" stop-color="' + p.c2 + '"/></linearGradient>' +
      '<linearGradient id="s' + u + '" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".5" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<filter id="b' + u + '" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="9"/></filter></defs>' +
      '<ellipse cx="200" cy="464" rx="140" ry="13" fill="#000" opacity=".28" filter="url(#b' + u + ')"/>' +
      shapes[p.pack](p, u) + '</svg>';
  };
  /* Studio renders (assets/packs/<id>.jpg) – the SVG drawing above is kept only as an offline fallback. */
  window.GXPack = function (p) {
    return '<img class="pack" src="assets/packs/' + p.id + '.jpg" alt="' + p.name + ' packaging" width="1000" height="1100" loading="lazy" decoding="async">';
  };
})();
