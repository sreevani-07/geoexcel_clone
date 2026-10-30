/* GeoExcel – shared shell: nav, theme, cart, gateway, page logic. No build step, no dependencies. */
(function () {
  'use strict';
  var G = window.GX, C = G.config;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = new Intl.NumberFormat(C.locale, { style: 'currency', currency: C.currency, maximumFractionDigits: 0 });
  var byId = function (id) { return G.products.filter(function (p) { return p.id === id; })[0]; };
  var catById = function (id) { return G.categories.filter(function (c) { return c.id === id; })[0]; };

  /* ---------- safe storage ---------- */
  var mem = {};
  function store(k, v) {
    try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); }
    catch (e) { if (v === undefined) return mem[k] || null; mem[k] = v; }
  }

  /* ---------- theme ---------- */
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('gx-theme', t); } catch (e) {}
    var b = $('.theme'); if (b) b.setAttribute('aria-pressed', t === 'dark');
  }

  /* ---------- cart ---------- */
  var cart = store('gx-cart') || [];
  function save() { store('gx-cart', cart); renderCart(); }
  function unit(l) { var p = byId(l.id); return p.sizes.filter(function (s) { return s.l === l.size; })[0].p; }
  function subtotal() { return cart.reduce(function (a, l) { return a + unit(l) * l.qty; }, 0); }
  function shipping(sub) { return !sub || sub >= C.freeShippingOver ? 0 : C.shippingFlat; }
  function count() { return cart.reduce(function (a, l) { return a + l.qty; }, 0); }
  function add(id, size, qty) {
    var f = cart.filter(function (l) { return l.id === id && l.size === size; })[0];
    if (f) f.qty += qty; else cart.push({ id: id, size: size, qty: qty });
    save();
  }
  function thumb(p) { return '<div class="thumb" aria-hidden="true">' + window.GXPack(p) + '</div>'; }

  /* ---------- shell ---------- */
  var ICON = {
    sun: '<svg class="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
    moon: '<svg class="moon" viewBox="0 0 24 24"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 8h16M4 16h16"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  function shell() {
    var page = document.body.dataset.page;
    var nav = [['index.html', 'Home', 'home'], ['about.html', 'About', 'about'], ['products.html', 'Products', 'products'], ['contact.html', 'Contact', 'contact']];
    $('#gx-nav').outerHTML =
      '<a class="sr" href="#main">Skip to content</a>' +
      '<header class="nav"><a class="brand" href="index.html" aria-label="GeoExcel home"><img src="assets/logo.png" alt="" width="34" height="34"><span>GEO EXCEL</span></a>' +
      '<nav class="links" id="links" aria-label="Main">' + nav.map(function (n) {
        var cur = page === n[2] || (n[2] === 'products' && (page === 'product')) ? ' aria-current="page"' : '';
        return '<a href="' + n[0] + '"' + cur + '>' + n[1] + '</a>';
      }).join('') + '</nav>' +
      '<div class="tools"><button class="icon-btn theme" aria-label="Toggle dark mode" aria-pressed="false">' + ICON.sun + ICON.moon + '</button>' +
      '<button class="icon-btn" id="cart-open" aria-label="Open cart">' + ICON.bag + '<span class="badge" id="badge">0</span></button>' +
      '<button class="icon-btn burger" aria-label="Menu" aria-expanded="false" aria-controls="links">' + ICON.menu + '</button></div></header>';

    var f = $('#gx-foot');
    if (f) f.outerHTML = '<footer class="foot"><div class="wrap"><div><b style="letter-spacing:.16em">GEO EXCEL</b><br><small>Facilitating international &amp; domestic trade · Bangalore</small></div>' +
      '<nav aria-label="Footer"><a href="products.html">Products</a><a href="about.html">About</a><a href="contact.html">Contact</a><a href="mailto:' + C.email + '">' + C.email + '</a></nav>' +
      '<small>© ' + new Date().getFullYear() + ' GeoExcel Group</small></div></footer>';

    document.body.insertAdjacentHTML('beforeend',
      '<div class="scrim" id="scrim"></div>' +
      '<aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Your cart" aria-hidden="true"><div class="drawer-head"><h2>Your cart</h2><button class="icon-btn" id="cart-close" aria-label="Close cart">' + ICON.x + '</button></div>' +
      '<div class="drawer-body" id="cart-body"></div><div class="drawer-foot" id="cart-foot"></div></aside><div class="toast" id="toast" role="status" aria-live="polite"></div>');

    setTheme(document.documentElement.dataset.theme || 'light');
    $('.theme').addEventListener('click', function () { setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); });
    var burger = $('.burger'), links = $('#links');
    burger.addEventListener('click', function () { var o = links.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
    $('#cart-open').addEventListener('click', openCart);
    $('#cart-close').addEventListener('click', closeCart);
    $('#scrim').addEventListener('click', closeCart);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeCart(); links.classList.remove('open'); } });
    renderCart();
  }

  var lastFocus;
  function openCart() { lastFocus = document.activeElement; $('#drawer').classList.add('on'); $('#drawer').setAttribute('aria-hidden', 'false'); $('#scrim').classList.add('on'); $('#cart-close').focus(); }
  function closeCart() { var d = $('#drawer'); if (!d.classList.contains('on')) return; d.classList.remove('on'); d.setAttribute('aria-hidden', 'true'); $('#scrim').classList.remove('on'); if (lastFocus) lastFocus.focus(); }
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('on'); }, 2200); }

  function renderCart() {
    var b = $('#badge'); if (!b) return;
    var n = count(); b.textContent = n; b.classList.toggle('on', n > 0);
    var body = $('#cart-body'), foot = $('#cart-foot');
    if (!cart.length) {
      body.innerHTML = '<div class="empty"><p>Your cart is empty.</p><p style="margin-top:8px"><a href="products.html" style="text-decoration:underline">Browse products</a></p></div>';
      foot.innerHTML = ''; return;
    }
    body.innerHTML = cart.map(function (l, i) {
      var p = byId(l.id);
      return '<div class="line">' + thumb(p) + '<div><h3><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3><small>' + l.size + ' · ' + money.format(unit(l)) + '</small>' +
        '<div class="qty"><button data-d="-1" data-i="' + i + '" aria-label="Decrease">−</button><output>' + l.qty + '</output><button data-d="1" data-i="' + i + '" aria-label="Increase">+</button></div></div>' +
        '<div><div class="amt">' + money.format(unit(l) * l.qty) + '</div><button class="rm" data-rm="' + i + '">Remove</button></div></div>';
    }).join('');
    var s = subtotal(), sh = shipping(s);
    foot.innerHTML = '<div class="sum"><span>Subtotal</span><span>' + money.format(s) + '</span></div>' +
      '<div class="sum"><span>Shipping</span><span>' + (sh ? money.format(sh) : 'Free') + '</span></div>' +
      '<div class="sum total"><span>Total</span><span>' + money.format(s + sh) + '</span></div>' +
      '<a class="btn btn-primary btn-block" href="checkout.html">Checkout</a>';
    $$('[data-d]', body).forEach(function (el) { el.onclick = function () { var l = cart[+el.dataset.i]; l.qty = Math.max(1, l.qty + +el.dataset.d); save(); }; });
    $$('[data-rm]', body).forEach(function (el) { el.onclick = function () { cart.splice(+el.dataset.rm, 1); save(); }; });
  }

  /* ---------- payment gateway adapter ----------
     pay(order) -> Promise<{id, method}>.  With a Razorpay keyId configured it opens Razorpay Checkout;
     otherwise it shows a built-in demo sheet (no real money moves). */
  function pay(order) {
    var g = C.gateway;
    if (g.keyId) return razorpay(order, g);
    return demoSheet(order);
  }
  function razorpay(order, g) {
    return new Promise(function (res, rej) {
      function go() {
        var rz = new window.Razorpay({
          key: g.keyId, amount: Math.round(order.total * 100), currency: C.currency, name: g.brand, description: 'Order ' + order.id,
          prefill: { name: order.customer.name, email: order.customer.email, contact: order.customer.phone },
          theme: { color: '#f58a1f' },
          handler: function (r) { res({ id: r.razorpay_payment_id, method: 'razorpay' }); },
          modal: { ondismiss: function () { rej(new Error('cancelled')); } }
        });
        rz.open();
      }
      if (window.Razorpay) return go();
      var s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = go;
      s.onerror = function () { rej(new Error('Could not load the payment gateway.')); }; document.head.appendChild(s);
    });
  }
  function demoSheet(order) {
    return new Promise(function (res, rej) {
      var el = document.createElement('div'); el.className = 'gw';
      el.innerHTML = '<div class="gw-card" role="dialog" aria-modal="true" aria-label="Secure payment"><div class="gw-head"><div><b>' + C.gateway.brand + '</b><br><span>Order ' + order.id + '</span></div><b>' + money.format(order.total) + '</b></div><div class="gw-body" id="gw-body"></div></div>';
      document.body.appendChild(el);
      var body = $('#gw-body', el), tab = 'upi';
      function form() {
        body.innerHTML = '<div class="tabs" role="tablist"><button role="tab" data-t="upi" aria-selected="' + (tab === 'upi') + '">UPI</button><button role="tab" data-t="card" aria-selected="' + (tab === 'card') + '">Card</button></div>' +
          '<form id="gw-form" class="f" style="display:grid;gap:12px" novalidate>' +
          (tab === 'upi' ? '<div><label for="upi">UPI ID</label><input id="upi" placeholder="name@bank" autocomplete="off" required></div>' :
            '<div><label for="cn">Card number</label><input id="cn" inputmode="numeric" placeholder="4111 1111 1111 1111" autocomplete="cc-number" required></div><div class="fields"><div><label for="ce">Expiry</label><input id="ce" placeholder="MM / YY" autocomplete="cc-exp" required></div><div><label for="cv">CVV</label><input id="cv" inputmode="numeric" placeholder="•••" autocomplete="cc-csc" required></div></div>') +
          '<button class="btn btn-primary btn-block" type="submit">Pay ' + money.format(order.total) + '</button><button class="btn btn-ghost btn-block" type="button" id="gw-x">Cancel</button>' +
          '<p class="demo-note">Demo mode – nothing is charged. Add your Razorpay key in js/data.js to go live.</p></form>';
        $$('[data-t]', body).forEach(function (b) { b.onclick = function () { tab = b.dataset.t; form(); }; });
        $('#gw-x', body).onclick = function () { el.remove(); rej(new Error('cancelled')); };
        $('#gw-form', body).onsubmit = function (e) {
          e.preventDefault();
          var ins = $$('input', body);
          if (ins.some(function (i) { return !i.value.trim(); })) { ins.filter(function (i) { return !i.value.trim(); })[0].focus(); return; }
          body.innerHTML = '<div class="spin" role="status" aria-label="Processing"></div><p class="demo-note">Processing payment…</p>';
          setTimeout(function () {
            body.innerHTML = '<div class="ok"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><b style="font-size:20px">Payment successful</b></div>';
            setTimeout(function () { el.remove(); res({ id: 'demo_' + Date.now().toString(36), method: tab }); }, 900);
          }, 1500);
        };
        var f = $('input', body); if (f) f.focus();
      }
      form();
    });
  }

  /* ---------- page: products ---------- */
  function card(p) {
    var from = Math.min.apply(null, p.sizes.map(function (s) { return s.p; }));
    return '<a class="card" href="product.html?id=' + p.id + '"><div class="art">' + window.GXPack(p) + '</div><div class="info"><span class="cat">' + catById(p.cat).name + '</span><h3>' + p.name + '</h3><span class="price">from <b>' + money.format(from) + '</b></span></div></a>';
  }
  function pageProducts() {
    var chips = $('#chips'), grid = $('#grid'), cur = (location.hash || '').slice(1) || 'all';
    function draw() {
      chips.innerHTML = [{ id: 'all', name: 'All' }].concat(G.categories).map(function (c) { return '<button class="chip" data-c="' + c.id + '" aria-pressed="' + (c.id === cur) + '">' + c.name + '</button>'; }).join('');
      grid.innerHTML = G.products.filter(function (p) { return cur === 'all' || p.cat === cur; }).map(card).join('');
      $$('.chip', chips).forEach(function (b) { b.onclick = function () { cur = b.dataset.c; history.replaceState(null, '', cur === 'all' ? location.pathname : '#' + cur); draw(); }; });
    }
    window.addEventListener('hashchange', function () { cur = location.hash.slice(1) || 'all'; draw(); });
    draw();
  }

  /* ---------- page: product ---------- */
  function pageProduct() {
    var id = new URLSearchParams(location.search).get('id'), p = byId(id), root = $('#pd');
    if (!p) { root.innerHTML = '<div class="empty"><h1>Product not found</h1><p style="margin:12px 0"><a href="products.html" style="text-decoration:underline">Back to products</a></p></div>'; return; }
    document.title = p.name + ' · GeoExcel';
    var cat = catById(p.cat), size = p.sizes[0], qty = 1, view = 'pack';
    function paint() {
      root.innerHTML =
        '<div class="gallery"><div class="stage">' + (view === 'photo' ? '<img class="photo" src="' + p.photo + '" alt="' + p.name + ' source ingredient">' : window.GXPack(p)) + '</div>' +
        (p.photo ? '<div class="thumbs"><button class="thumb" data-v="pack" aria-pressed="' + (view === 'pack') + '" aria-label="Pack render">' + window.GXPack(p) + '</button><button class="thumb" data-v="photo" aria-pressed="' + (view === 'photo') + '" aria-label="Product photo"><img src="' + p.photo + '" alt=""></button></div>' : '') + '</div>' +
        '<div><span class="eyebrow">' + cat.name + '</span><h1>' + p.name + '</h1><p class="lead">' + p.desc + '</p>' +
        '<div class="price-big">' + money.format(size.p * qty) + '</div><div class="note">' + (size.p * qty >= C.freeShippingOver ? 'Free shipping' : 'Free shipping over ' + money.format(C.freeShippingOver)) + ' · Taxes included</div>' +
        '<div class="label">Pack size</div><div class="sizes">' + p.sizes.map(function (s) { return '<button class="size" data-s="' + s.l + '" aria-pressed="' + (s.l === size.l) + '">' + s.l + '<small>' + money.format(s.p) + '</small></button>'; }).join('') + '</div>' +
        '<div class="buy"><div class="qty"><button id="q-" aria-label="Decrease quantity">−</button><output aria-live="polite">' + qty + '</output><button id="q+" aria-label="Increase quantity">+</button></div><button class="btn btn-primary" id="addbtn">Add to cart</button></div>' +
        '<dl class="specs">' + p.specs.map(function (s) { return '<div><dt>' + s[0] + '</dt><dd>' + s[1] + '</dd></div>'; }).join('') + '</dl></div>';
      $$('[data-v]', root).forEach(function (b) { b.onclick = function () { view = b.dataset.v; paint(); }; });
      $$('[data-s]', root).forEach(function (b) { b.onclick = function () { size = p.sizes.filter(function (s) { return s.l === b.dataset.s; })[0]; paint(); $$('.size', root).filter(function (x) { return x.dataset.s === size.l; })[0].focus(); }; });
      $('#q-', root).onclick = function () { qty = Math.max(1, qty - 1); paint(); $('#q-', root).focus(); };
      $('#q\\+', root).onclick = function () { qty = Math.min(99, qty + 1); paint(); $('#q\\+', root).focus(); };
      $('#addbtn', root).onclick = function () { add(p.id, size.l, qty); toast(p.name + ' added'); openCart(); };
    }
    paint();
    $('#crumb').innerHTML = '<a href="products.html">Products</a> / <a href="products.html#' + p.cat + '">' + cat.name + '</a> / ' + p.name;
    $('#related').innerHTML = G.products.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).concat(G.products.filter(function (x) { return x.cat !== p.cat; })).slice(0, 4).map(card).join('');
  }

  /* ---------- page: checkout ---------- */
  function pageCheckout() {
    var root = $('#co');
    if (!cart.length) { root.innerHTML = '<div class="wrap thanks" style="padding-top:calc(var(--nav-h) + 80px)"><h1>Your cart is empty</h1><p>Add something from the catalogue first.</p><a class="btn btn-primary" href="products.html">Browse products</a></div>'; return; }
    var s = subtotal(), sh = shipping(s), total = s + sh;
    root.innerHTML = '<div class="wrap"><div class="page-head" style="padding-bottom:20px"><span class="eyebrow">Checkout</span><h1 style="font-size:clamp(34px,5vw,56px)">Almost there</h1></div>' +
      '<form class="two" id="co-form" novalidate><div>' +
      '<div class="panel-box"><h2>Delivery details</h2><div class="fields f">' +
      '<div class="full"><label for="name">Full name / company</label><input id="name" name="name" autocomplete="name" required></div>' +
      '<div><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required></div>' +
      '<div><label for="phone">Phone</label><input id="phone" name="phone" type="tel" autocomplete="tel" required></div>' +
      '<div class="full"><label for="addr">Address</label><input id="addr" name="addr" autocomplete="street-address" required></div>' +
      '<div><label for="city">City</label><input id="city" name="city" autocomplete="address-level2" required></div>' +
      '<div><label for="pin">PIN / ZIP</label><input id="pin" name="pin" autocomplete="postal-code" required></div></div></div>' +
      '<div class="panel-box"><h2>Payment</h2><div class="pay-opts">' +
      '<label class="pay-opt"><input type="radio" name="pm" value="online" checked><div><b>Pay online</b><small>UPI, cards, netbanking &amp; wallets via secure gateway</small></div></label>' +
      '<label class="pay-opt"><input type="radio" name="pm" value="invoice"><div><b>Request invoice</b><small>Bulk / business orders – we reply with bank-transfer details</small></div></label></div></div></div>' +
      '<aside class="panel-box summary"><h2>Order summary</h2>' + cart.map(function (l) {
        var p = byId(l.id); return '<div class="mini">' + thumb(p) + '<div><h3>' + p.name + '</h3><small>' + l.size + ' × ' + l.qty + '</small></div><b>' + money.format(unit(l) * l.qty) + '</b></div>';
      }).join('') +
      '<div class="sum" style="margin-top:14px"><span>Subtotal</span><span>' + money.format(s) + '</span></div><div class="sum"><span>Shipping</span><span>' + (sh ? money.format(sh) : 'Free') + '</span></div>' +
      '<div class="sum total" style="margin:10px 0 18px"><span>Total</span><span>' + money.format(total) + '</span></div>' +
      '<button class="btn btn-primary btn-block" type="submit" id="place">Pay ' + money.format(total) + '</button><p class="safe">Secure checkout · taxes included</p></aside></form></div>';

    var form = $('#co-form'), btn = $('#place');
    $$('input[name=pm]', form).forEach(function (r) { r.onchange = function () { btn.textContent = r.value === 'online' ? 'Pay ' + money.format(total) : 'Request invoice'; }; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = $$('input', form).filter(function (i) { return i.type !== 'radio' && !i.value.trim(); })[0];
      if (bad) { bad.focus(); bad.style.borderColor = 'var(--red)'; return; }
      var em = $('#email', form); if (!/^\S+@\S+\.\S+$/.test(em.value)) { em.focus(); em.style.borderColor = 'var(--red)'; return; }
      var d = {}; $$('input', form).forEach(function (i) { if (i.type !== 'radio') d[i.name] = i.value.trim(); });
      var method = $('input[name=pm]:checked', form).value;
      var order = { id: 'GX' + Date.now().toString(36).toUpperCase(), items: cart.slice(), subtotal: s, shipping: sh, total: total, customer: d, method: method, at: new Date().toISOString() };
      btn.disabled = true;
      function done(payment) {
        order.payment = payment; var all = store('gx-orders') || []; all.push(order); store('gx-orders', all);
        cart = []; save();
        root.innerHTML = '<div class="wrap thanks"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h1>Thank you, ' + d.name.split(' ')[0].replace(/[<>&"]/g, '') + '.</h1>' +
          '<p>Order <b>' + order.id + '</b> ' + (method === 'online' ? 'is paid and confirmed.' : 'is received. We will email invoice details shortly.') + ' A confirmation goes to ' + d.email.replace(/[<>&"]/g, '') + '.</p><a class="btn btn-primary" href="products.html">Continue shopping</a></div>';
        window.scrollTo(0, 0);
      }
      if (method === 'invoice') return done({ id: null, method: 'invoice' });
      pay(order).then(done, function (err) { btn.disabled = false; if (err && err.message !== 'cancelled') toast(err.message); });
    });
  }

  /* ---------- page: contact (mailto – works with no backend) ---------- */
  function pageContact() {
    var f = $('#contact-form');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { return f.elements[n].value.trim(); };
      var body = 'Name: ' + v('first') + ' ' + v('last') + '\nEmail: ' + v('email') + '\n\n' + v('msg');
      location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent('Enquiry from ' + v('first')) + '&body=' + encodeURIComponent(body);
      $('#sent').hidden = false;
    });
  }

  /* ---------- page: about (road progress) ---------- */
  function pageAbout() {
    var road = $('.road'); if (!road) return;
    function upd() {
      var r = road.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * .55 - r.top) / r.height));
      road.style.setProperty('--p', p.toFixed(4));
    }
    window.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
  }

  /* ---------- page: home (featured + count-up) ---------- */
  function pageHome() {
    var f = $('#home-feat');
    if (f) f.innerHTML = ['basmati-1121', 'black-pepper', 'sesame-oil', 'iqf-green-peas'].map(function (id) { return card(byId(id)); }).join('');
    $$('.vgrid .vcard, .steps li, .grid .card').forEach(function (e, i) { e.classList.add('reveal', 'd' + (i % 4)); });
    $$('[data-to]').forEach(function (el) {
      var from = +el.dataset.from, to = +el.dataset.to, suf = el.dataset.suffix || '', done = false;
      function run() {
        if (done) return; done = true;
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = to + suf; return; }
        var t0 = performance.now();
        (function tick(t) { var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * e) + (k === 1 ? suf : ''); if (k < 1) requestAnimationFrame(tick); })(t0);
      }
      if (!('IntersectionObserver' in window)) return run();
      new IntersectionObserver(function (en, io) { if (en[0].isIntersecting) { run(); io.disconnect(); } }, { threshold: .6 }).observe(el);
    });
  }

  /* ---------- reveal on scroll ---------- */
  function reveal() {
    var els = $$('.stop, .reveal');
    if (!('IntersectionObserver' in window)) return els.forEach(function (e) { e.classList.add('in'); });
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: .15 });
    els.forEach(function (e) { io.observe(e); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    shell();
    var pg = document.body.dataset.page;
    if (pg === 'products') pageProducts();
    if (pg === 'product') pageProduct();
    if (pg === 'checkout') pageCheckout();
    if (pg === 'contact') pageContact();
    if (pg === 'about') pageAbout();
    if (pg === 'home') pageHome();
    reveal();
  });
})();
